import Link from 'next/link'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="18" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="32" cy="18" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <ellipse cx="24" cy="30" rx="10" ry="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="21" cy="28" r="1.5" fill="currentColor"/>
              <circle cx="27" cy="28" r="1.5" fill="currentColor"/>
              <ellipse cx="24" cy="31" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title">Mouse Trap News</span>
            <span className="logo-tagline">The Moused Trusted Name in Disney News</span>
          </div>
        </Link>

        <nav className="main-nav">
          <Link href="/" className="nav-link">Home</Link>
          <div className="nav-dropdown">
            <span className="nav-link" style={{ cursor: 'pointer' }}>
              Parks <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M1 1l4 4 4-4"/></svg>
            </span>
            <div className="nav-dropdown-menu">
              <Link href="/category/magic-kingdom">Magic Kingdom</Link>
              <Link href="/category/epcot">EPCOT</Link>
              <Link href="/category/hollywood-studios">Hollywood Studios</Link>
              <Link href="/category/animal-kingdom">Animal Kingdom</Link>
              <Link href="/category/resorts">Resorts</Link>
              <Link href="/category/cross-property">Cross Property</Link>
            </div>
          </div>
          <Link href="/category/other" className="nav-link">Other</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="header-actions">
          <Link href="#newsletter" className="btn btn-glow btn-sm">Subscribe &#10024;</Link>
        </div>
      </div>
    </header>
  )
}
