import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo logo--header" aria-label="Mouse Trap News — Home">
          <Image
            src="/logo-oneline.png"
            alt="Mouse Trap News"
            width={4957}
            height={603}
            priority
            className="logo-img"
          />
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
