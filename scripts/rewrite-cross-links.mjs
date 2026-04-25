#!/usr/bin/env node
/**
 * Rewrites cross-article links inside article bodies.
 *
 * Old WordPress links look like https://www.mousetrapnews.com/post/<slug>
 * (or http://, with/without www, with trailing slash, with query/hash).
 * On the new site, articles live at /<slug>, so we want internal links.
 *
 * Behavior:
 *  - For every article body block's markDefs entry of _type "link":
 *      - parse the href; if it points to a mousetrapnews.com /post/<slug>,
 *        and that slug exists as an article in Sanity, rewrite href to /<slug>.
 *      - if the slug does NOT exist on the new site, leave the link alone
 *        (writer can decide whether to delete or repoint manually).
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/rewrite-cross-links.mjs --dry  # report only
 *   SANITY_TOKEN=<token> node scripts/rewrite-cross-links.mjs        # apply
 */

import { createClient } from '@sanity/client'

const DRY = process.argv.includes('--dry')

const TOKEN = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

if (!TOKEN && !DRY) {
  console.error('Missing SANITY_WRITE_TOKEN (or SANITY_TOKEN) env var (required unless --dry)')
  process.exit(1)
}

// Match http(s)://(www.)?mousetrapnews.com/post/<slug>(/)?(?...|#...)?
const POST_RE = /^https?:\/\/(?:www\.)?mousetrapnews\.com\/post\/([^/?#]+)\/?(?:[?#].*)?$/i

// Pull every article with a body so we can scan markDefs
const articles = await client.fetch(`
  *[_type == "article" && defined(body)]{ _id, title, "slug": slug.current, body }
`)
console.log(`Loaded ${articles.length} articles.`)

// Build a set of existing slugs once
const existingSlugs = new Set(
  await client.fetch(`*[_type == "article" && defined(slug.current)].slug.current`)
)
console.log(`Known slugs in Sanity: ${existingSlugs.size}`)

let scanned = 0
let toRewrite = 0
let leftAlone = 0
let articlesTouched = 0
const patches = []

for (const article of articles) {
  const body = article.body
  if (!Array.isArray(body)) continue

  let articleChanged = false
  // We rebuild body, mutating only link markDefs that need rewriting
  const newBody = body.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.markDefs)) return block
    let blockChanged = false
    const newDefs = block.markDefs.map((def) => {
      if (def._type !== 'link' || !def.href) return def
      scanned++
      const m = def.href.match(POST_RE)
      if (!m) return def
      const slug = m[1].toLowerCase()
      if (!existingSlugs.has(slug)) {
        leftAlone++
        return def
      }
      blockChanged = true
      toRewrite++
      return { ...def, href: `/${slug}` }
    })
    if (!blockChanged) return block
    return { ...block, markDefs: newDefs }
  })

  if (newBody.some((b, i) => b !== body[i])) {
    articleChanged = true
    articlesTouched++
    patches.push({ _id: article._id, title: article.title, body: newBody })
  }
}

console.log(`\nLinks scanned:     ${scanned}`)
console.log(`Will rewrite:      ${toRewrite}`)
console.log(`Left alone:        ${leftAlone}  (target slug not in new site)`)
console.log(`Articles touched:  ${articlesTouched}`)

if (DRY) {
  console.log('\nDry run — no changes written. Re-run without --dry to apply.')
  process.exit(0)
}

if (toRewrite === 0) {
  console.log('\nNothing to do.')
  process.exit(0)
}

console.log('\nApplying patches...')
let n = 0
for (const p of patches) {
  await client.patch(p._id).set({ body: p.body }).commit()
  n++
  if (n % 25 === 0) console.log(`  ${n}/${patches.length}`)
}
console.log(`\nDone. Patched ${patches.length} articles.`)
