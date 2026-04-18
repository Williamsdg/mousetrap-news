'use client'

import { useEffect, useRef } from 'react'

export default function MagicParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const colors = ['#f0c040', '#b8a9e8', '#4ecdc4', '#ffd86e']

    const interval = setInterval(() => {
      if (document.hidden) return

      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDuration = (4 + Math.random() * 4) + 's'
      particle.style.animationDelay = Math.random() * 2 + 's'
      const size = (2 + Math.random() * 4) + 'px'
      particle.style.width = size
      particle.style.height = size
      particle.style.background = colors[Math.floor(Math.random() * colors.length)]
      container.appendChild(particle)

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle)
      }, 8000)
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
