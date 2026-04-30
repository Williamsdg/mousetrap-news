'use client'

import { useEffect, useRef, useState } from 'react'

export type AdType =
  | 'leaderboard'      // 728×90 (desktop) / 320×100 (mobile)
  | 'inline'           // responsive in-content rectangle
  | 'sidebar'          // 300×250
  | 'sidebar-tall'     // 300×600
  | 'mobile-sticky'    // 320×50 anchored
  | 'in-feed'          // homepage post-feed in-feed unit

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
const adConfig: Record<
  AdType,
  {
    label: string
    desktopHeight: number
    mobileHeight: number
    /**
     * Maps the slot type to the env var that holds the AdSense ad-unit
     * slot ID Michael creates in his AdSense dashboard. When the env var
     * is unset we fall back to the static tan placeholder so dev/preview
     * deploys without secrets still render visibly.
     */
    slotEnvVar: string
    /**
     * AdSense data-ad-format value. Most slots use 'auto' (responsive);
     * the special types use specific formats per AdSense docs.
     */
    format: string
    /**
     * Some formats (in-article, in-feed) require a layout key from
     * AdSense. Optional otherwise.
     */
    layout?: string
  }
> = {
  leaderboard:    { label: 'Advertisement — 728×90 Leaderboard',  desktopHeight: 90,  mobileHeight: 100, slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD',    format: 'auto' },
  inline:         { label: 'Advertisement',                       desktopHeight: 280, mobileHeight: 250, slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE',    format: 'fluid', layout: 'in-article' },
  sidebar:        { label: 'Advertisement — 300×250',             desktopHeight: 250, mobileHeight: 250, slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR',       format: 'auto' },
  'sidebar-tall': { label: 'Advertisement — 300×600',             desktopHeight: 600, mobileHeight: 250, slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_TALL',  format: 'auto' },
  'mobile-sticky':{ label: 'Advertisement — 320×50',              desktopHeight: 50,  mobileHeight: 50,  slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_ANCHOR', format: 'auto' },
  'in-feed':      { label: 'Advertisement',                       desktopHeight: 280, mobileHeight: 250, slotEnvVar: 'NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED',       format: 'fluid', layout: 'in-feed' },
}

declare global {
  interface Window {
    adsbygoogle?: object[]
  }
}

export default function AdSlot({ type, className, eager = false }: AdSlotProps) {
  const config = adConfig[type]
  const ref = useRef<HTMLDivElement | null>(null)
  const insRef = useRef<HTMLModElement | null>(null)
  const [visible, setVisible] = useState(eager)
  // `collapsed` is set to true if AdSense never fills this slot (ad blocker
  // hid it, AdSense returned no creative, or the script never loaded).
  // When collapsed, we drop the reserved height + margin so the article
  // reflows naturally with no mysterious gap.
  const [collapsed, setCollapsed] = useState(false)
  const pushedRef = useRef(false)

  // Read the AdSense client + per-type slot ID at render time. Both must be
  // present for the integration to render real <ins> markup; otherwise we
  // gracefully show the placeholder and skip the adsbygoogle.push.
  // Note: process.env.NEXT_PUBLIC_* values are inlined at build time, so
  // these are safe to read on the client.
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const envSlots: Record<string, string | undefined> = {
    NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
    NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
    NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
    NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_TALL: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_TALL,
    NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_ANCHOR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_ANCHOR,
    NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED,
  }
  const slotId = envSlots[config.slotEnvVar]
  const adsenseConfigured = Boolean(clientId && slotId)

  useEffect(() => {
    if (visible || !ref.current) return
    // Render the ad placeholder once it gets within 400px of the viewport.
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

  // Push the slot to AdSense once it's visible and we haven't pushed yet.
  // adsbygoogle.push triggers AdSense's auction + render for the <ins>.
  useEffect(() => {
    if (!visible || !adsenseConfigured || pushedRef.current) return
    if (typeof window === 'undefined') return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushedRef.current = true
    } catch (err) {
      // adsbygoogle script may not have loaded yet; AdSense's own retry
      // handles re-pushing once it's available, so just log and move on.
      console.warn('[AdSlot] adsbygoogle push failed:', err)
    }
  }, [visible, adsenseConfigured])

  // Ad-fill detection: 3 seconds after the slot mounts, check whether
  // AdSense actually filled it. Three signals that mean "no ad":
  //   1. The <ins> element was removed from the DOM (ad blocker)
  //   2. data-ad-status === "unfilled" (AdSense had no creative to serve)
  //   3. Rendered height is 0 (ad blocker collapsed it via CSS)
  // In any of those cases we set collapsed=true so the parent .ad-slot
  // drops its reserved height and margin, letting the article reflow.
  useEffect(() => {
    if (!visible || !adsenseConfigured) return
    if (typeof window === 'undefined') return
    const timer = window.setTimeout(() => {
      const ins = insRef.current
      if (!ins || !ins.isConnected) {
        setCollapsed(true)
        return
      }
      const status = ins.getAttribute('data-ad-status')
      const rect = ins.getBoundingClientRect()
      if (status === 'unfilled' || rect.height < 10) {
        setCollapsed(true)
      }
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [visible, adsenseConfigured])

  // When the slot is collapsed (no ad served), zero out the reserved
  // dimensions so the article flows as if the slot wasn't there at all.
  const slotStyle: React.CSSProperties = collapsed
    ? { display: 'none' }
    : {
        ['--ad-h-desktop' as string]: `${config.desktopHeight}px`,
        ['--ad-h-mobile' as string]: `${config.mobileHeight}px`,
        margin: type === 'inline' ? '2.5rem 0' : undefined,
      }

  return (
    <div
      ref={ref}
      className={`ad-slot ad-slot--${type} ${className || ''}`}
      data-ad-slot={type}
      style={slotStyle}
    >
      {!visible ? (
        // Reserved-space pending state (before lazy-mount fires).
        <div className="ad-placeholder ad-placeholder--pending" aria-hidden="true" />
      ) : adsenseConfigured ? (
        // Real AdSense unit. Block-level <ins> uses the reserved height via
        // its parent .ad-slot's --ad-h-* CSS vars (set in globals.css).
        <ins
          ref={insRef}
          className="adsbygoogle ad-adsense"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={config.format}
          {...(config.layout && { 'data-ad-layout': config.layout })}
          data-full-width-responsive="true"
        />
      ) : (
        // Demo placeholder when AdSense env vars aren't configured yet.
        <div className="ad-placeholder">{config.label}</div>
      )}
    </div>
  )
}
