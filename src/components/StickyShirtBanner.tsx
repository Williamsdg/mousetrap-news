'use client'

import { useEffect, useRef, useState } from 'react'

const SHIRT_URL = 'https://www.etsy.com/shop/mousetrapnews/?etsrc=sdt'

interface StickyShirtBannerProps {
  // Selector of the element that, once visible, should hide the banner.
  // Defaults to '.article-outro' so the banner steps aside as the reader
  // approaches the end-of-article CTA + sticky bottom ad.
  hideWhenVisible?: string
}

export default function StickyShirtBanner({ hideWhenVisible = '.article-outro' }: StickyShirtBannerProps) {
  const [hidden, setHidden] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const ref = useRef<HTMLDivElement | null>(null)

  // Persist dismissal for the session so it doesn't keep popping back on
  // every article. Same pattern as the mobile sticky ad.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setDismissed(sessionStorage.getItem('mtn_sticky_shirt_dismissed') === '1')
  }, [])

  // Hide the banner once the outro / bottom region scrolls into view, so
  // it doesn't compete with the in-article ad and outro CTA. Show again
  // if the user scrolls back up.
  useEffect(() => {
    if (typeof window === 'undefined' || dismissed) return
    const target = document.querySelector(hideWhenVisible)
    if (!target) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Hide when the outro starts coming into view (a bit of headroom
        // so the transition feels intentional, not jumpy).
        setHidden(entry.isIntersecting)
      },
      { rootMargin: '0px 0px -120px 0px' }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [hideWhenVisible, dismissed])

  if (dismissed) return null

  return (
    <aside
      ref={ref}
      className={`sticky-shirt${hidden ? ' sticky-shirt--hidden' : ''}`}
      aria-label="Mouse Trap News merchandise"
    >
      <a
        href={SHIRT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-shirt__link"
      >
        <span className="sticky-shirt__icon" aria-hidden="true">👕</span>
        <span className="sticky-shirt__text">
          <strong>Get a Mouse Trap News shirt</strong>
          <span className="sticky-shirt__sub">Wear it around Disney World — Mickey will love it</span>
        </span>
        <span className="sticky-shirt__cta">Shop on Etsy →</span>
      </a>
      <button
        type="button"
        className="sticky-shirt__close"
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem('mtn_sticky_shirt_dismissed', '1')
          setDismissed(true)
        }}
      >
        ×
      </button>
    </aside>
  )
}
