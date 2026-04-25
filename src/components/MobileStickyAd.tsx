'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'mtn_mobile_sticky_dismissed'

export default function MobileStickyAd() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const wasDismissed = sessionStorage.getItem(SESSION_KEY) === '1'
    setDismissed(wasDismissed)
  }, [])

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
        Advertisement — 320×50
      </div>
    </div>
  )
}
