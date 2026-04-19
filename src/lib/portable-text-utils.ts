// Convert Sanity Portable Text blocks to HTML for the editor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''

  return blocks.map((block) => {
    if (block._type === 'block') {
      const children = (block.children || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((child: any) => {
          let text = child.text || ''
          const marks = child.marks || []
          if (marks.includes('strong')) text = `<strong>${text}</strong>`
          if (marks.includes('em')) text = `<em>${text}</em>`
          if (marks.includes('underline')) text = `<u>${text}</u>`
          if (marks.includes('strike-through')) text = `<s>${text}</s>`
          // Handle link annotations
          if (block.markDefs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            marks.forEach((mark: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // Simple regex-based parser — handles common patterns from Tiptap
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
          const children = parseInlineContent(el)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (children.length > 0 && children.some((c: any) => c.text?.trim())) {
            result.push({
              _type: 'block',
              _key: crypto.randomUUID().slice(0, 8),
              style: 'normal',
              children,
              markDefs: parseMarkDefs(el),
            })
          }
        } else if (tag === 'hr') {
          // Skip horizontal rules for now — Sanity doesn't have a native HR block
        }
      }
    })

    return result
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
