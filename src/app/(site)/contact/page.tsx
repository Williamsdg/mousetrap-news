import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Mouse Trap News',
  description: 'Get in touch with Mouse Trap News. Press, advertising, story tips, or just want to say hello — we\'d love to hear from you.',
  openGraph: {
    title: 'Contact Mouse Trap News',
    description: 'Press, advertising, story tips, or just to say hello.',
    images: ['/og-default.png'],
  },
}

export default function ContactPage() {
  return (
    <article className="static-page">
      <header className="static-page-hero">
        <div className="container">
          <span className="hero-badge">Contact</span>
          <h1 className="static-page-title">Get In Touch</h1>
          <p className="static-page-subtitle">
            Press, advertising, story tips, or just want to say hello? We read every email.
          </p>
        </div>
      </header>

      <div className="container static-page-body">
        <section className="static-section">
          <h2>Email</h2>
          <p>
            The fastest way to reach us is by email. Our CEO, Michael Morrow, personally
            reads everything that comes in.
          </p>
          <p style={{ fontSize: '1.15rem' }}>
            <strong>
              <a href="mailto:themousetrapnews@gmail.com">themousetrapnews@gmail.com</a>
            </strong>
          </p>
          <p>Please be patient &mdash; replies typically take 1&ndash;3 business days.</p>
        </section>

        <section className="static-section">
          <h2>Social Media</h2>
          <p>
            For quick questions or just to say hi, you can also reach us on any of our
            social platforms (500,000+ followers and counting):
          </p>
          <ul className="static-social-list">
            <li><a href="https://www.tiktok.com/@mousetrapnews" target="_blank" rel="noopener noreferrer">TikTok &mdash; @mousetrapnews</a></li>
            <li><a href="https://www.instagram.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Instagram &mdash; @mousetrapnews</a></li>
            <li><a href="https://www.facebook.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Facebook &mdash; The Mouse Trap News</a></li>
            <li><a href="https://x.com/mousetrapnews" target="_blank" rel="noopener noreferrer">X / Twitter &mdash; @mousetrapnews</a></li>
          </ul>
        </section>

        <section className="static-section">
          <h2>What to email us about</h2>
          <ul className="static-bullets">
            <li><strong>Press &amp; media inquiries</strong> &mdash; interview requests, fact-checks, story syndication</li>
            <li><strong>Advertising &amp; sponsorships</strong> &mdash; rates, formats, available inventory</li>
            <li><strong>Story tips</strong> &mdash; spotted something happening at a park that&apos;s ripe for parody?</li>
            <li><strong>Corrections</strong> &mdash; if we get a real-world fact wrong inside a satire piece, let us know</li>
            <li><strong>Just to say hi</strong> &mdash; we love hearing from readers</li>
          </ul>
        </section>

        <section className="static-section">
          <h2>A reminder</h2>
          <p>
            Mouse Trap News is a satire and parody site. Every article we publish is
            fictional. We are not affiliated with The Walt Disney Company in any way. If
            you&apos;re looking to contact Disney directly, you&apos;ll want{' '}
            <a href="https://disneyworld.disney.go.com/help/" target="_blank" rel="noopener noreferrer">disneyworld.disney.go.com/help</a>.
          </p>
        </section>
      </div>
    </article>
  )
}
