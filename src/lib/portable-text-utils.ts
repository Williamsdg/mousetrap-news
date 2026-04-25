// Convert Sanity Portable Text blocks to HTML for the editor
/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper to derive a Sanity CDN URL from an asset _ref like "image-abc123-1920x1080-jpg"
// Format: https://cdn.sanity.io/images/{projectId}/{dataset}/{assetId}-{dimensions}.{format}
function sanityImageUrl(assetRef: string): string {
  // image-abc123def-1920x1080-jpg → abc123def-1920x1080.jpg
  const match = assetRef.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/i)
  if (!match) return ''
  const [, id, dims, ext] = match
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '81uq8kg1'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${ext}`
}

export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''

  return blocks.map((block) => {
    // Inline image block — render as <img> with data-sanity-asset for round-trip preservation
    if (block._type === 'image' && block.asset?._ref) {
      const url = sanityImageUrl(block.asset._ref)
      const alt = (block.alt || block.caption || '').replace(/"/g, '&quot;')
      return `<img src="${url}" alt="${alt}" data-sanity-asset="${block.asset._ref}">`
    }

    if (block._type === 'block') {
      const children = (block.children || [])
        .map((child: any) => {
          let text = (child.text || '').replace(/\n/g, '<br>')
          const marks = child.marks || []
          if (marks.includes('strong')) text = `<strong>${text}</strong>`
          if (marks.includes('em')) text = `<em>${text}</em>`
          if (marks.includes('underline')) text = `<u>${text}</u>`
          if (marks.includes('strike-through')) text = `<s>${text}</s>`
          // Handle link annotations
          if (block.markDefs) {
            marks.forEach((mark: any) => {
              const def = block.markDefs.find((d: any) => d._key === mark)
              if (def && def._type === 'link') {
                text = `<a href="${def.href}">${text}</a>`
              }
            })
          }
          return text
        })
        .join('')

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
          result.push({
            _type: 'block',
            _key: crypto.randomUUID().slice(0, 8),
            style: tag,
            children: parseInlineContent(el),
            markDefs: parseMarkDefs(el),
          })
        } else if (tag === 'blockquote') {
          // Get text from inner <p> or direct content
          const inner = el.querySelector('p') || el
          result.push({
            _type: 'block',
            _key: crypto.randomUUID().slice(0, 8),
            style: 'blockquote',
            children: parseInlineContent(inner),
            markDefs: parseMarkDefs(inner),
          })
        } else if (tag === 'ul' || tag === 'ol') {
          const listType = tag === 'ul' ? 'bullet' : 'number'
          el.querySelectorAll('li').forEach((li) => {
            result.push({
              _type: 'block',
              _key: crypto.randomUUID().slice(0, 8),
              style: 'normal',
              listItem: listType,
              level: 1,
              children: parseInlineContent(li),
              markDefs: parseMarkDefs(li),
            })
          })
        } else if (tag === 'p') {
          // A paragraph might wrap an image (Tiptap sometimes does this) — extract it
          const innerImg = el.querySelector('img')
          if (innerImg && el.textContent?.trim() === '') {
            const imgBlock = imgToBlock(innerImg)
            if (imgBlock) result.push(imgBlock)
            return
          }

          const children = parseInlineContent(el)
          if (children.length > 0 && children.some((c: any) => c.text?.trim())) {
            result.push({
              _type: 'block',
              _key: crypto.randomUUID().slice(0, 8),
              style: 'normal',
              children,
              markDefs: parseMarkDefs(el),
            })
          }
        } else if (tag === 'img') {
          // Image at the top level (Tiptap with inline:false)
          const imgBlock = imgToBlock(el as HTMLImageElement)
          if (imgBlock) result.push(imgBlock)
        } else if (tag === 'hr') {
          // Skip horizontal rules — Sanity doesn't have a native HR block
        } else if (tag === 'figure') {
          // Recurse into figure tags (also extract embedded img)
          const innerImg = el.querySelector('img')
          if (innerImg) {
            const imgBlock = imgToBlock(innerImg as HTMLImageElement)
            if (imgBlock) result.push(imgBlock)
          }
        }
      }
    })

    return result
  }

  function imgToBlock(img: HTMLImageElement): unknown | null {
    const assetRef = img.getAttribute('data-sanity-asset')
    if (!assetRef) {
      // No Sanity asset reference — image wasn't uploaded through our flow.
      // Skip it (rather than save a broken external URL into Portable Text).
      // Console-log helps writers debug if they pasted in an external image.
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
    return block
  }

  function parseInlineContent(el: Element): unknown[] {
    const spans: unknown[] = []

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
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()
        const newMarks = [...marks]

        if (tag === 'strong' || tag === 'b') newMarks.push('strong')
        if (tag === 'em' || tag === 'i') newMarks.push('em')
        if (tag === 'u') newMarks.push('underline')
        if (tag === 's' || tag === 'del') newMarks.push('strike-through')
        if (tag === 'a') {
          const key = crypto.randomUUID().slice(0, 8)
          newMarks.push(key)
        }
        if (tag === 'mark') newMarks.push('highlight')
        if (tag === 'br') {
          spans.push({
            _type: 'span',
            _key: crypto.randomUUID().slice(0, 8),
            text: '\n',
            marks: [...marks],
          })
          return
        }

        el.childNodes.forEach((child) => walk(child, newMarks))
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

    return spans
  }

  function parseMarkDefs(el: Element): unknown[] {
    const defs: unknown[] = []
    el.querySelectorAll('a').forEach((a) => {
      const key = crypto.randomUUID().slice(0, 8)
      defs.push({
        _type: 'link',
        _key: key,
        href: a.getAttribute('href') || '',
      })
    })
    return defs
  }

  blocks.push(...processNode(doc.body))
  return blocks
}
