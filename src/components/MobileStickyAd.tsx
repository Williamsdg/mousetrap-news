'use client'

import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'mtn_mobile_sticky_dismissed'

declare global {
  interface Window {
    adsbygoogle?: object[]
  }
}

export default function MobileStickyAd() {
  const [dismissed, setDismissed] = useState(true)
  const pushedRef = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_ANCHOR
  const adsenseConfigured = Boolean(clientId && slotId)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const wasDismissed = sessionStorage.getItem(SESSION_KEY) === '1'
    setDismissed(wasDismissed)
  }, [])

  // Push the slot to AdSense when it mounts visibly. Mobile sticky is a
  // single instance, so we don't need lazy-loading or IntersectionObserver
  // here — the user already sees it as soon as the page renders on mobile.
  useEffect(() => {
    if (dismissed || !adsenseConfigured || pushedRef.current) return
    if (typeof window === 'undefined') return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushedRef.current = true
    } catch (err) {
      console.warn('[MobileStickyAd] adsbygoogle push failed:', err)
    }
  }, [dismissed, adsenseConfigured])

  if (dismissed) return null

  return (
    <div className="mobile-sticky-ad" role="complementary" aria-label="Advertisement">
      <button
        type="button"
        className="mobile-sticky-ad__close"
        aria-label="Close ad"
        onClick={() => {
          sessionStorage.setItem(SESSION_KEY, '1')
          setDismissed(true)
        }}
      >
        ×
      </button>
      <div className="mobile-sticky-ad__inner">
        {adsenseConfigured ? (
          // Locked to a 320×50 banner — without this AdSense's "auto"
          // format can balloon the slot to fullscreen on mobile, which
          // visually breaks the page since this container is
          // position: fixed at bottom: 0.
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '320px', height: '50px' }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
          />
        ) : (
          'Advertisement — 320×50'
        )}
      </div>
    </div>
  )
}
