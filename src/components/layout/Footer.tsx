import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo-text">
            <span className="logo-title">Mouse Trap News</span>
            <span className="logo-tagline">The Moused Trusted Name in Disney News</span>
          </div>
          <p className="footer-desc">
            The world&apos;s best satire site for Disney Parks news. Everything on this site is made up. Please don&apos;t sue us, Mickey.
          </p>
          <div className="footer-social">
            <a href="https://www.tiktok.com/@mousetrapnews" target="_blank" rel="noopener noreferrer" className="footer-social-link">TikTok</a>
            <a href="https://www.instagram.com/mousetrapnews/" target="_blank" rel="noopener noreferrer" className="footer-social-link">Instagram</a>
            <a href="https://www.facebook.com/mousetrapnews/" target="_blank" rel="noopener noreferrer" className="footer-social-link">Facebook</a>
            <a href="https://x.com/mousetrapnews" target="_blank" rel="noopener noreferrer" className="footer-social-link">X</a>
          </div>
        </div>
        <div className="footer-links">
          <h4>Parks</h4>
          <Link href="/category/magic-kingdom">Magic Kingdom</Link>
          <Link href="/category/epcot">EPCOT</Link>
          <Link href="/category/hollywood-studios">Hollywood Studios</Link>
          <Link href="/category/animal-kingdom">Animal Kingdom</Link>
          <Link href="/category/resorts">Resorts</Link>
          <Link href="/category/cross-property">Cross Property</Link>
        </div>
        <div className="footer-links">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <a href="#">Advertise</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-links">
          <h4>Follow Along</h4>
          <a href="https://www.tiktok.com/@mousetrapnews" target="_blank" rel="noopener noreferrer">TikTok (500K+)</a>
          <a href="https://www.instagram.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Facebook</a>
          <Link href="#newsletter">Newsletter</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>&copy; {new Date().getFullYear()} Mouse Trap News. All stories are satire and parody. None of this is real. Mostly.</span>
          <span style={{ fontStyle: 'italic' }}>Mouse Trap News is not affiliated with, endorsed by, or in any way connected to The Walt Disney Company.</span>
        </div>
      </div>
    </footer>
  )
}
