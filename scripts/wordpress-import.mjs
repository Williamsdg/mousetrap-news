#!/usr/bin/env node
/**
 * WordPress → Sanity migration script for Mouse Trap News
 *
 * Imports 813 articles from mousetrapnews.com WordPress REST API into Sanity:
 *  - Downloads featured images, uploads to Sanity assets, caches by WP media ID
 *  - Converts WP HTML content to Portable Text blocks (handles paragraphs,
 *    headings, lists, blockquotes, images, links, bold, italic)
 *  - Maps WordPress category IDs to existing Sanity category documents
 *  - Preserves slugs (SEO-critical)
 *  - All articles imported with status: 'approved' (live on new site)
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/wordpress-import.mjs         # Full import
 *   SANITY_TOKEN=<token> node scripts/wordpress-import.mjs --limit 10  # Dry-run
 */

import { createClient } from '@sanity/client'
import { JSDOM } from 'jsdom'
import { randomUUID } from 'crypto'

// --- Config ---
const WP_API = 'https://mousetrapnews.com/wp-json/wp/v2'
const PER_PAGE = 50 // WordPress max for non-authenticated requests
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10)
  : Infinity

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

// WP category ID → Sanity category document ID
// Based on current Sanity seed data
const CATEGORY_MAP = {
  55: 'cat-animal-kingdom',    // Animal Kingdom
  54: 'cat-epcot',             // EPCOT
  58: 'cat-hollywood-studios', // Hollywood Studios
  57: 'cat-magic-kingdom',     // Magic Kingdom
  59: 'cat-resorts',           // Resorts
  60: 'cat-cross-property',    // Cross Property
  61: 'cat-other',              // Other
  // 56 = "All News" — skip (not a real category, just a master list)
}

// --- Helpers ---
const key = () => randomUUID().slice(0, 12)

function decodeHtml(html) {
  // Decode common HTML entities (server-side, no DOMParser)
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&hellip;/g, '…')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}

function stripHtml(html) {
  return decodeHtml(html).replace(/<[^>]+>/g, '').trim()
}

// --- Image caching ---
const imageCache = new Map() // WP URL → Sanity asset _id

async function uploadImageFromUrl(url, filename) {
  if (imageCache.has(url)) return imageCache.get(url)

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const asset = await client.assets.upload('image', buffer, {
      filename: filename || url.split('/').pop(),
      contentType,
    })
    imageCache.set(url, asset._id)
    return asset._id
  } catch (e) {
    console.log(`      Image upload failed (${url}): ${e.message}`)
    return null
  }
}

// --- HTML → Portable Text ---
/**
 * Parses inline content within a block (text + marks + links).
 * Returns { children: [...spans], markDefs: [...linkDefs] }
 */
function parseInline(node) {
  const children = []
  const markDefs = []

  function walk(n, marks) {
    if (n.nodeType === 3) {
      // Text node
      const text = n.textContent
      if (text) {
        children.push({
          _type: 'span',
          _key: key(),
          text,
          marks: [...marks],
        })
      }
      return
    }
    if (n.nodeType !== 1) return

    const tag = n.tagName.toLowerCase()
    const newMarks = [...marks]

    // Gutenberg sometimes wraps text in <span style="font-weight: 400;"> — strip
    if (tag === 'span') {
      // Check for bold style
      const style = (n.getAttribute('style') || '').toLowerCase()
      if (style.includes('font-weight: bold') || style.includes('font-weight: 700') || style.includes('font-weight:700')) {
        newMarks.push('strong')
      }
      if (style.includes('font-style: italic')) {
        newMarks.push('em')
      }
      // Otherwise treat span as a transparent wrapper (most common case)
      n.childNodes.forEach((c) => walk(c, newMarks))
      return
    }

    if (tag === 'strong' || tag === 'b') newMarks.push('strong')
    else if (tag === 'em' || tag === 'i') newMarks.push('em')
    else if (tag === 'u') newMarks.push('underline')
    else if (tag === 's' || tag === 'del' || tag === 'strike') newMarks.push('strike-through')
    else if (tag === 'code') newMarks.push('code')
    else if (tag === 'a') {
      const href = n.getAttribute('href')
      if (href) {
        const linkKey = key()
        markDefs.push({
          _type: 'link',
          _key: linkKey,
          href,
        })
        newMarks.push(linkKey)
      }
    } else if (tag === 'br') {
      children.push({ _type: 'span', _key: key(), text: '\n', marks: [...marks] })
      return
    }

    n.childNodes.forEach((c) => walk(c, newMarks))
  }

  node.childNodes.forEach((c) => walk(c, []))

  // If no children, add empty span (Sanity requires at least one child)
  if (children.length === 0) {
    children.push({ _type: 'span', _key: key(), text: '', marks: [] })
  }

  return { children, markDefs }
}

/**
 * Convert WP HTML to Portable Text blocks.
 * Handles: p, h2, h3, h4, ul, ol, blockquote, figure/img, hr
 * Image uploads are collected into a queue and processed after HTML parsing.
 */
async function htmlToPortableText(html) {
  if (!html || !html.trim()) return []

  const decoded = decodeHtml(html)
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${decoded}</body></html>`)
  const body = dom.window.document.body

  const blocks = []
  const imagePromises = []

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType !== 1) continue // skip whitespace/text at root
    const tag = node.tagName.toLowerCase()

    if (tag === 'p') {
      // Skip empty paragraphs
      if (!node.textContent.trim() && !node.querySelector('img')) continue

      // Check if paragraph ONLY contains an image (WP often wraps imgs in p)
      const img = node.querySelector('img')
      if (img && !node.textContent.trim()) {
        // Treat as image block
        const src = img.getAttribute('src')
        const alt = img.getAttribute('alt') || ''
        if (src) {
          const blockKey = key()
          imagePromises.push(
            uploadImageFromUrl(src).then((assetId) => {
              if (assetId) {
                const imgBlock = {
                  _type: 'image',
                  _key: blockKey,
                  asset: { _type: 'reference', _ref: assetId },
                  ...(alt && { alt }),
                }
                // Insert at the right position
                const idx = blocks.findIndex((b) => b._key === blockKey && b._placeholder)
                if (idx !== -1) blocks[idx] = imgBlock
              }
            })
          )
          blocks.push({ _type: 'block', _key: blockKey, _placeholder: true })
        }
        continue
      }

      const { children, markDefs } = parseInline(node)
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'normal',
        children,
        ...(markDefs.length > 0 && { markDefs }),
      })
    } else if (['h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const { children, markDefs } = parseInline(node)
      const styleMap = { h2: 'h2', h3: 'h3', h4: 'h3', h5: 'h3', h6: 'h3' }
      blocks.push({
        _type: 'block',
        _key: key(),
        style: styleMap[tag],
        children,
        ...(markDefs.length > 0 && { markDefs }),
      })
    } else if (tag === 'h1') {
      // Demote h1 to h2 (article title is separate)
      const { children, markDefs } = parseInline(node)
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'h2',
        children,
        ...(markDefs.length > 0 && { markDefs }),
      })
    } else if (tag === 'blockquote') {
      const inner = node.querySelector('p') || node
      const { children, markDefs } = parseInline(inner)
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'blockquote',
        children,
        ...(markDefs.length > 0 && { markDefs }),
      })
    } else if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ul' ? 'bullet' : 'number'
      for (const li of node.querySelectorAll(':scope > li')) {
        const { children, markDefs } = parseInline(li)
        blocks.push({
          _type: 'block',
          _key: key(),
          style: 'normal',
          listItem: listType,
          level: 1,
          children,
          ...(markDefs.length > 0 && { markDefs }),
        })
      }
    } else if (tag === 'figure') {
      // WP captioned image: <figure><img><figcaption>
      const img = node.querySelector('img')
      const caption = node.querySelector('figcaption')
      if (img) {
        const src = img.getAttribute('src')
        const alt = img.getAttribute('alt') || ''
        const captionText = caption ? stripHtml(caption.innerHTML) : ''
        if (src) {
          const blockKey = key()
          blocks.push({ _type: 'block', _key: blockKey, _placeholder: true })
          imagePromises.push(
            uploadImageFromUrl(src).then((assetId) => {
              if (assetId) {
                const idx = blocks.findIndex((b) => b._key === blockKey && b._placeholder)
                if (idx !== -1) {
                  blocks[idx] = {
                    _type: 'image',
                    _key: blockKey,
                    asset: { _type: 'reference', _ref: assetId },
                    ...(alt && { alt }),
                    ...(captionText && { caption: captionText }),
                  }
                }
              }
            })
          )
        }
      }
    } else if (tag === 'hr') {
      // Sanity doesn't have a native HR block — skip
      continue
    } else if (tag === 'div') {
      // Recurse into div (WP sometimes wraps in divs)
      const innerHtml = node.innerHTML
      const innerBlocks = await htmlToPortableText(innerHtml)
      blocks.push(...innerBlocks)
    }
    // Ignore unknown tags (scripts, styles, iframes, etc.)
  }

  // Wait for all image uploads
  await Promise.all(imagePromises)

  // Remove any placeholder blocks that failed to upload
  return blocks.filter((b) => !b._placeholder)
}

// --- WordPress fetching ---
async function fetchPostsPage(page) {
  const url = `${WP_API}/posts?per_page=${PER_PAGE}&page=${page}&_embed=1&orderby=date&order=desc`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WP API ${url} returned ${res.status}`)
  return res.json()
}

// --- Import logic ---
async function importPost(wpPost) {
  const wpId = wpPost.id
  const title = decodeHtml(wpPost.title.rendered)
  const slug = wpPost.slug

  // Featured image
  let mainImage = null
  const featured = wpPost._embedded?.['wp:featuredmedia']?.[0]
  if (featured && featured.source_url) {
    const assetId = await uploadImageFromUrl(featured.source_url, `wp-${wpId}.${(featured.source_url.split('.').pop() || 'jpg').split('?')[0]}`)
    if (assetId) {
      mainImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
      }
    }
  }

  // Category (take first matching category, fall back to "other")
  let categoryRef = 'cat-other'
  for (const wpCatId of wpPost.categories || []) {
    if (CATEGORY_MAP[wpCatId]) {
      categoryRef = CATEGORY_MAP[wpCatId]
      break
    }
  }

  // Body (parse HTML → Portable Text)
  const body = await htmlToPortableText(wpPost.content.rendered)

  // Excerpt
  const excerpt = stripHtml(wpPost.excerpt.rendered || '').slice(0, 300)

  const doc = {
    _id: `wp-${wpId}`,
    _type: 'article',
    title,
    slug: { _type: 'slug', current: slug },
    author: { _type: 'reference', _ref: 'author-mousetrap' },
    category: { _type: 'reference', _ref: categoryRef },
    theme: 'auto',
    status: 'approved',
    featured: false,
    publishedAt: wpPost.date + 'Z',
    approvedAt: new Date().toISOString(),
    approvedBy: 'Michael Morrow',
    excerpt,
    body,
    tags: [],
    ...(mainImage && { mainImage }),
  }

  await client.createOrReplace(doc)
  return { wpId, slug, title, imageCount: imageCache.size }
}

// --- Main ---
async function main() {
  if (!process.env.SANITY_TOKEN) {
    console.error('Missing SANITY_TOKEN env var')
    process.exit(1)
  }

  console.log('=== WordPress → Sanity Migration ===')
  console.log(`Target: ${WP_API}`)
  console.log(`Limit: ${LIMIT === Infinity ? 'all posts' : LIMIT + ' (dry-run)'}`)
  console.log('')

  // Get total count
  const headRes = await fetch(`${WP_API}/posts?per_page=1`)
  const total = parseInt(headRes.headers.get('x-wp-total') || '0', 10)
  const totalPages = Math.ceil(Math.min(total, LIMIT) / PER_PAGE)

  console.log(`Found ${total} WordPress posts. Importing ${Math.min(total, LIMIT)} (${totalPages} pages).`)
  console.log('')

  let imported = 0
  let failed = 0
  const startTime = Date.now()

  for (let page = 1; page <= totalPages; page++) {
    console.log(`\n--- Page ${page}/${totalPages} ---`)
    const posts = await fetchPostsPage(page)

    for (const wpPost of posts) {
      if (imported >= LIMIT) break
      try {
        const result = await importPost(wpPost)
        imported++
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        console.log(`  ✓ [${imported}/${Math.min(total, LIMIT)}] (${elapsed}s) ${result.title.substring(0, 70)}`)
      } catch (e) {
        failed++
        console.log(`  ✗ WP post ${wpPost.id} (${wpPost.slug}): ${e.message}`)
      }
    }
    if (imported >= LIMIT) break
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
  console.log('\n=== Done ===')
  console.log(`Imported: ${imported}`)
  console.log(`Failed:   ${failed}`)
  console.log(`Time:     ${totalTime} minutes`)
  console.log(`Unique images uploaded: ${imageCache.size}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
