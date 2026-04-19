interface AdSlotProps {
  type: 'leaderboard' | 'inline' | 'sidebar' | 'sidebar-tall' | 'mobile-sticky'
  className?: string
}

const adConfig = {
  leaderboard: { label: 'Advertisement — 728×90 Leaderboard', padding: '2rem 1.5rem' },
  inline: { label: 'Advertisement', padding: '1.5rem' },
  sidebar: { label: 'Advertisement — 300×250', padding: '3rem 1.5rem' },
  'sidebar-tall': { label: 'Advertisement — 300×600', padding: '6rem 1.5rem' },
  'mobile-sticky': { label: 'Advertisement — 320×50', padding: '0.75rem 1rem' },
}

export default function AdSlot({ type, className }: AdSlotProps) {
  const config = adConfig[type]

  return (
    <div
      className={`ad-slot ${className || ''}`}
      data-ad-slot={type}
      style={{ margin: type === 'inline' ? '2.5rem 0' : undefined }}
    >
      <div className="ad-placeholder" style={{ padding: config.padding }}>
        {config.label}
      </div>
    </div>
  )
}
