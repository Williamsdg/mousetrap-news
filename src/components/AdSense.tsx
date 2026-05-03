'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// Renders the AdSense loader script when NEXT_PUBLIC_ADSENSE_CLIENT is set.
// We defer the actual <Script> mount until either:
//   (a) the user has scrolled at all, or
//   (b) 3 seconds have passed since first interactive
// Whichever comes first. This keeps adsbygoogle.js (~300KB + many sub-fetches)
// off the critical path so it doesn't compete with LCP on first paint.
// Most ad slots are below the fold anyway; the ones near the top still get
// served because (b) fires within a few seconds either way.
export default function AdSense() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (!client) return
    let armed = true
    const trigger = () => {
      if (!armed) return
      armed = false
      setShouldLoad(true)
      window.removeEventListener('scroll', trigger)
      window.removeEventListener('touchstart', trigger)
    }
    window.addEventListener('scroll', trigger, { passive: true, once: true })
    window.addEventListener('touchstart', trigger, { passive: true, once: true })
    const fallback = window.setTimeout(trigger, 3000)
    return () => {
      armed = false
      window.removeEventListener('scroll', trigger)
      window.removeEventListener('touchstart', trigger)
      window.clearTimeout(fallback)
    }
  }, [client])

  if (!client || !shouldLoad) return null

  return (
    <Script
      id="adsense-loader"
      async
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  )
}
