// Auto-generate an excerpt from Portable Text body blocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateExcerpt(body: any[], maxLength: number = 160): string {
  if (!body || !Array.isArray(body)) return ''

  const text = body
    .filter((block) => block._type === 'block' && block.style === 'normal')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .flatMap((block) => (block.children || []).map((child: any) => child.text || ''))
    .join(' ')
    .trim()

  if (!text) return ''
  if (text.length <= maxLength) return text

  // Cut at last word boundary before maxLength
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

// Generate excerpt from HTML (for admin editor)
export function generateExcerptFromHtml(html: string, maxLength: number = 160): string {
  if (!html) return ''

  // Strip HTML tags
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}
