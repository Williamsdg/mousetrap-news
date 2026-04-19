interface CategoryBadgeProps {
  title: string
  color?: string
}

export default function CategoryBadge({ title, color = '#2d1b69' }: CategoryBadgeProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '180px',
      background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-8%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }} />

      {/* Brand name */}
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        marginBottom: '0.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        Mouse Trap News
      </span>

      {/* Category name */}
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '1.5rem',
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.2,
        position: 'relative',
        zIndex: 1,
      }}>
        {title}
      </span>

      {/* Underline accent */}
      <div style={{
        width: '40px',
        height: '3px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '2px',
        marginTop: '0.75rem',
        position: 'relative',
        zIndex: 1,
      }} />
    </div>
  )
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}
