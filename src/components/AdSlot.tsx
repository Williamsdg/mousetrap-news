'use client'

import { useEffect, useRef, useState } from 'react'

export type AdType =
  | 'leaderboard'      // 728×90 (desktop) / 320×100 (mobile)
  | 'inline'           // responsive in-content rectangle
  | 'sidebar'          // 300×250
  | 'sidebar-tall'     // 300×600
  | 'mobile-sticky'    // 320×50 anchored

interface AdSlotProps {
  type: AdType
  className?: string
  /**
   * Render the placeholder/ad immediately. Use for the first ad that's
   * above the fold so it counts toward viewability without waiting for
   * scroll. All other ads default to lazy.
   */
  eager?: boolean
}

// Reserved heights stop CLS — the slot takes its space before any ad code
// loads, so when the real creative arrives content doesn't shift.
// Mobile heights are tuned for 320×50 / 300×250 / 300×600 equivalents.
const adConfig: Record<AdType, { label: string; desktopHeight: number; mobileHeight: number }> = {
  leaderboard:    { label: 'Advertisement — 728×90 Leaderboard',  desktopHeight: 90,  mobileHeight: 100 },
  inline:         { label: 'Advertisement',                       desktopHeight: 280, mobileHeight: 250 },
  sidebar:        { label: 'Advertisement — 300×250',             desktopHeight: 250, mobileHeight: 250 },
  'sidebar-tall': { label: 'Advertisement — 300×600',             desktopHeight: 600, mobileHeight: 250 },
  'mobile-sticky':{ label: 'Advertisement — 320×50',              desktopHeight: 50,  mobileHeight: 50  },
}

export default function AdSlot({ type, className, eager = false }: AdSlotProps) {
  const config = adConfig[type]
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(eager)

  useEffect(() => {
    if (visible || !ref.current) return
    // Render the ad placeholder once it gets within 400px of the viewport.
    // 400px of headroom gives the ad network time to bid + load before the
    // user scrolls to it, so by the time it's actually viewable it's filled.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div
      ref={ref}
      className={`ad-slot ad-slot--${type} ${className || ''}`}
      data-ad-slot={type}
      // Reserve the slot's vertical space before the ad loads.
      // CSS variables let media queries override per breakpoint.
      style={{
        ['--ad-h-desktop' as string]: `${config.desktopHeight}px`,
        ['--ad-h-mobile' as string]: `${config.mobileHeight}px`,
        margin: type === 'inline' ? '2.5rem 0' : undefined,
      }}
    >
      {visible ? (
        <div className="ad-placeholder">
          {config.label}
        </div>
      ) : (
        <div className="ad-placeholder ad-placeholder--pending" aria-hidden="true" />
      )}
    </div>
  )
}
