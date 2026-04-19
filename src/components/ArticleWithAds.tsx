'use client'

import { useEffect, useRef } from 'react'

interface ArticleWithAdsProps {
  children: React.ReactNode
}

export default function ArticleWithAds({ children }: ArticleWithAdsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Find all direct block-level children (paragraphs, headings, etc.)
    const blocks = Array.from(ref.current.children)
    let paragraphCount = 0
    const insertAfter = [3, 7, 12] // Insert ads after these paragraph numbers
    const inserted: Element[] = []

    for (const block of blocks) {
      const tag = block.tagName?.toLowerCase()
      if (tag === 'p') {
        paragraphCount++

        if (insertAfter.includes(paragraphCount) && !block.nextElementSibling?.classList?.contains('auto-ad')) {
          const adSlot = document.createElement('div')
          adSlot.className = 'ad-slot auto-ad'
          adSlot.setAttribute('data-ad-slot', 'inline')
          adSlot.style.margin = '2.5rem 0'
          adSlot.innerHTML = `<div class="ad-placeholder" style="padding: 1.5rem">Advertisement</div>`
          block.after(adSlot)
          inserted.push(adSlot)
        }
      }
    }

    // Cleanup on unmount
    return () => {
      inserted.forEach(el => el.remove())
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
