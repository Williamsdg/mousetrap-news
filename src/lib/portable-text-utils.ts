// Convert Sanity Portable Text blocks to HTML for the editor
/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper to derive a Sanity CDN URL from an asset _ref like "image-abc123-1920x1080-jpg"
function sanityImageUrl(assetRef: string): string {
  const match = assetRef.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/i)
  if (!match) return ''
  const [, id, dims, ext] = match
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '81uq8kg1'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${ext}`
}

function escapeAttr(s: string): string {
  return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''

  return blocks.map((block) => {
    // Inline image
    if (block._type === 'image' && block.asset?._ref) {
      const url = sanityImageUrl(block.asset._ref)
      const alt = escapeAttr(block.alt || '')
      const caption = escapeAttr(block.caption || '')
      const alignment = escapeAttr(block.alignment || 'full')
      const size = escapeAttr(block.size || 'large')
      return `<img src="${url}" alt="${alt}" data-sanity-asset="${escapeAttr(block.asset._ref)}" data-caption="${caption}" data-alignment="${alignment}" data-size="${size}">`
    }

    // YouTube embed
    if (block._type === 'youtubeEmbed' && block.url) {
      const ytId = youtubeIdFromUrl(block.url)
      if (ytId) {
        return `<div data-youtube-video><iframe src="https://www.youtube-nocookie.com/embed/${ytId}" allowfullscreen></iframe></div>`
      }
      return ''
    }

    // Social embed — preserved as a marker; not editable inside Tiptap, so we round-trip
    // through a placeholder paragraph that won't be picked up by htmlToPortableText.
    if (block._type === 'socialEmbed') {
      // Skip rendering in editor; existing socialEmbed blocks are preserved at save time
      // by the caller (admin currently only edits via Tiptap so socialEmbeds added in Studio
      // remain in the document until Tiptap is the only editor).
      return ''
    }

    // Table block
    if (block._type === 'tableBlock' && Array.isArray(block.rows)) {
      const rows = block.rows as Array<{ cells?: string[] }>
      const hasHeader = block.hasHeader !== false
      const trs = rows.map((row, i) => {
        const cells = row.cells || []
        const tag = hasHeader && i === 0 ? 'th' : 'td'
        const tds = cells.map((c) => `<${tag}>${escapeHtml(c)}</${tag}>`).join('')
        return `<tr>${tds}</tr>`
      }).join('')
      return `<table><tbody>${trs}</tbody></table>`
    }

    if (block._type === 'block') {
      const children = (block.children || [])
        .map((child: any) => {
          let text = escapeHtml(child.text || '').replace(/\n/g, '<br>')
          const marks: string[] = child.marks || []

          // Decorator marks
          if (marks.includes('strong')) text = `<strong>${text}</strong>`
          if (marks.includes('em')) text = `<em>${text}</em>`
          if (marks.includes('underline')) text = `<u>${text}</u>`
          if (marks.includes('strike-through') || marks.includes('strike')) text = `<s>${text}</s>`
          if (marks.includes('highlight')) text = `<mark>${text}</mark>`

          // Annotation marks (link, footnote)
          if (block.markDefs) {
            marks.forEach((mark: string) => {
              const def = block.markDefs.find((d: any) => d._key === mark)
              if (!def) return
              if (def._type === 'link') {
                text = `<a href="${escapeAttr(def.href || '')}">${text}</a>`
              } else if (def._type === 'footnote') {
                text = `<span data-footnote="${escapeAttr(def.text || '')}">${text}</span>`
              }
            })
          }
          return text
        })
        .join('')

      // List items
      if (block.listItem === 'bullet') return `<ul><li>${children}</li></ul>`
      if (block.listItem === 'number') return `<ol><li>${children}</li></ol>`

      switch (block.style) {
        case 'h2': return `<h2>${children}</h2>`
        case 'h3': return `<h3>${children}</h3>`
        case 'blockquote': return `<blockquote><p>${children}</p></blockquote>`
        default: return `<p>${children}</p>`
      }
    }
    return ''
  }).join('\n')
}

// Convert HTML from the editor back to Sanity Portable Text blocks
export function htmlToPortableText(html: string): unknown[] {
  if (!html || html.trim() === '' || html === '<p></p>') return []

  const blocks: unknown[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const processNode = (node: Node): unknown[] => {
    const result: unknown[] = []

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const tag = el.tagName.toLowerCase()

        if (['h2', 'h3'].includes(tag)) {
          const inline = parseInlineContent(el)
          result.push({
            _type: 'block',
            _key: crypto.randomUUID().slice(0, 8),
            style: tag,
            children: inline.spans,
            markDefs: inline.markDefs,
          })
        } else if (tag === 'blockquote') {
          const inner = el.querySelector('p') || el
          const inline = parseInlineContent(inner)
          result.push({
            _type: 'block',
            _key: crypto.randomUUID().slice(0, 8),
            style: 'blockquote',
            children: inline.spans,
            markDefs: inline.markDefs,
          })
        } else if (tag === 'ul' || tag === 'ol') {
          const listType = tag === 'ul' ? 'bullet' : 'number'
          el.querySelectorAll('li').forEach((li) => {
            const inline = parseInlineContent(li)
            result.push({
              _type: 'block',
              _key: crypto.randomUUID().slice(0, 8),
              style: 'normal',
              listItem: listType,
              level: 1,
              children: inline.spans,
              markDefs: inline.markDefs,
            })
          })
        } else if (tag === 'p') {
          // A paragraph might wrap an image — extract it
          const innerImg = el.querySelector('img')
          if (innerImg && (el.textContent?.trim() === '' || el.children.length === 1)) {
            const imgBlock = imgToBlock(innerImg)
            if (imgBlock) result.push(imgBlock)
            return
          }

          const inline = parseInlineContent(el)
          if (inline.spans.length > 0 && inline.spans.some((c: any) => c.text?.trim())) {
            result.push({
              _type: 'block',
              _key: crypto.randomUUID().slice(0, 8),
              style: 'normal',
              children: inline.spans,
              markDefs: inline.markDefs,
            })
          }
        } else if (tag === 'img') {
          const imgBlock = imgToBlock(el as HTMLImageElement)
          if (imgBlock) result.push(imgBlock)
        } else if (tag === 'hr') {
          // Sanity doesn't have a native HR block — skip
        } else if (tag === 'figure') {
          const innerImg = el.querySelector('img')
          if (innerImg) {
            const imgBlock = imgToBlock(innerImg as HTMLImageElement)
            if (imgBlock) result.push(imgBlock)
          }
        } else if (tag === 'table') {
          const tableBlock = tableToBlock(el as HTMLTableElement)
          if (tableBlock) result.push(tableBlock)
        } else if (tag === 'div' && el.hasAttribute('data-youtube-video')) {
          const iframe = el.querySelector('iframe')
          if (iframe) {
            const src = iframe.getAttribute('src') || ''
            const m = src.match(/embed\/([\w-]{11})/)
            const id = m ? m[1] : null
            if (id) {
              result.push({
                _type: 'youtubeEmbed',
                _key: crypto.randomUUID().slice(0, 8),
                url: `https://www.youtube.com/watch?v=${id}`,
              })
            }
          }
        } else if (tag === 'iframe') {
          const src = el.getAttribute('src') || ''
          const m = src.match(/embed\/([\w-]{11})/)
          if (m) {
            result.push({
              _type: 'youtubeEmbed',
              _key: crypto.randomUUID().slice(0, 8),
              url: `https://www.youtube.com/watch?v=${m[1]}`,
            })
          }
        }
      }
    })

    return result
  }

  function imgToBlock(img: HTMLImageElement): unknown | null {
    const assetRef = img.getAttribute('data-sanity-asset')
    if (!assetRef) {
      console.warn('Skipping image without data-sanity-asset:', img.src)
      return null
    }
    const block: any = {
      _type: 'image',
      _key: crypto.randomUUID().slice(0, 8),
      asset: { _type: 'reference', _ref: assetRef },
    }
    const alt = img.getAttribute('alt')
    if (alt) block.alt = alt
    const caption = img.getAttribute('data-caption')
    if (caption) block.caption = caption
    const alignment = img.getAttribute('data-alignment')
    if (alignment) block.alignment = alignment
    const size = img.getAttribute('data-size')
    if (size) block.size = size
    return block
  }

  function tableToBlock(table: HTMLTableElement): unknown | null {
    const rows: { _key: string; _type: 'row'; cells: string[] }[] = []
    let hasHeader = false
    table.querySelectorAll('tr').forEach((tr, i) => {
      const cells = Array.from(tr.querySelectorAll('th, td')).map((c) => (c.textContent || '').trim())
      if (i === 0 && tr.querySelector('th')) hasHeader = true
      rows.push({ _key: crypto.randomUUID().slice(0, 8), _type: 'row', cells })
    })
    if (rows.length === 0) return null
    return {
      _type: 'tableBlock',
      _key: crypto.randomUUID().slice(0, 8),
      rows,
      hasHeader,
    }
  }

  function parseInlineContent(el: Element): { spans: unknown[]; markDefs: unknown[] } {
    const spans: unknown[] = []
    const markDefs: any[] = []

    const walk = (node: Node, marks: string[]) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        if (text) {
          spans.push({
            _type: 'span',
            _key: crypto.randomUUID().slice(0, 8),
            text,
            marks: [...marks],
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as HTMLElement
        const tag = elem.tagName.toLowerCase()
        const newMarks = [...marks]

        if (tag === 'strong' || tag === 'b') newMarks.push('strong')
        if (tag === 'em' || tag === 'i') newMarks.push('em')
        if (tag === 'u') newMarks.push('underline')
        if (tag === 's' || tag === 'del' || tag === 'strike') newMarks.push('strike-through')
        if (tag === 'mark') newMarks.push('highlight')
        if (tag === 'a') {
          const key = crypto.randomUUID().slice(0, 8)
          markDefs.push({
            _type: 'link',
            _key: key,
            href: elem.getAttribute('href') || '',
          })
          newMarks.push(key)
        }
        if (tag === 'span' && elem.hasAttribute('data-footnote')) {
          const key = crypto.randomUUID().slice(0, 8)
          markDefs.push({
            _type: 'footnote',
            _key: key,
            text: elem.getAttribute('data-footnote') || '',
          })
          newMarks.push(key)
        }
        if (tag === 'br') {
          spans.push({
            _type: 'span',
            _key: crypto.randomUUID().slice(0, 8),
            text: '\n',
            marks: [...marks],
          })
          return
        }

        elem.childNodes.forEach((child) => walk(child, newMarks))
      }
    }

    el.childNodes.forEach((child) => walk(child, []))

    if (spans.length === 0) {
      spans.push({
        _type: 'span',
        _key: crypto.randomUUID().slice(0, 8),
        text: '',
        marks: [],
      })
    }

    return { spans, markDefs }
  }

  blocks.push(...processNode(doc.body))
  return blocks
}
