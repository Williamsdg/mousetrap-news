'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  // Close menu when navigating away on the same render tree
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [open])

  // Lock body scroll while open so the overlay doesn't double-scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo logo--header" aria-label="Mouse Trap News — Home" onClick={() => setOpen(false)}>
          <Image
            src="/logo-oneline.png"
            alt="Mouse Trap News"
            width={4957}
            height={603}
            priority
            className="logo-img"
          />
        </Link>

        <nav className={`main-nav${open ? ' active' : ''}`} aria-label="Main">
          <Link href="/" className="nav-link" onClick={() => setOpen(false)}>Home</Link>
          <div className="nav-dropdown">
            <span className="nav-link" style={{ cursor: 'pointer' }}>
              Parks <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>
            </span>
            <div className="nav-dropdown-menu">
              <Link href="/category/magic-kingdom" onClick={() => setOpen(false)}>Magic Kingdom</Link>
              <Link href="/category/epcot" onClick={() => setOpen(false)}>EPCOT</Link>
              <Link href="/category/hollywood-studios" onClick={() => setOpen(false)}>Hollywood Studios</Link>
              <Link href="/category/animal-kingdom" onClick={() => setOpen(false)}>Animal Kingdom</Link>
              <Link href="/category/resorts" onClick={() => setOpen(false)}>Resorts</Link>
              <Link href="/category/cross-property" onClick={() => setOpen(false)}>Cross Property</Link>
            </div>
          </div>
          <Link href="/category/other" className="nav-link" onClick={() => setOpen(false)}>Other</Link>
          <Link href="/about" className="nav-link" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" className="nav-link" onClick={() => setOpen(false)}>Contact</Link>
        </nav>

        <div className="header-actions">
          <Link href="#newsletter" className="btn btn-glow btn-sm">Subscribe &#10024;</Link>
          <button
            type="button"
            className={`mobile-menu-toggle${open ? ' active' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
