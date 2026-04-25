import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Mouse Trap News',
  description: 'Mouse Trap News is the world\'s best satire and parody site for Disney Parks news. Run solely by CEO Michael Morrow, with 500,000+ followers across social media. As featured on The Tonight Show, SNL, USA Today, AP, Snopes, and more.',
  openGraph: {
    title: 'About Mouse Trap News',
    description: 'Run solely by CEO Michael Morrow. 500,000+ social followers. Featured on The Tonight Show, SNL, USA Today, AP, and more.',
    images: ['/og-default.png'],
  },
}

interface PressItem {
  outlet: string
  description: React.ReactNode
}

const pressMentions: PressItem[] = [
  {
    outlet: 'The Tonight Show Starring Jimmy Fallon',
    description: (
      <>
        Jimmy Fallon discussed our Disney roller coaster story during his monologue in
        Season 10, Episode 38. <a href="https://www.nbc.com/the-tonight-show" target="_blank" rel="noopener noreferrer">Watch the episode</a>.
      </>
    ),
  },
  {
    outlet: 'Saturday Night Live',
    description: (
      <>
        Our &ldquo;Magic Kingdom Maternity Ward&rdquo; story made it onto Weekend Update.
        Michael Che&apos;s exact words: <em>&ldquo;The only catch is Goofy gets to watch.&rdquo;</em>{' '}
        <a href="https://www.youtube.com/saturdaynightlive" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>.
      </>
    ),
  },
  {
    outlet: 'The Associated Press',
    description: (
      <>
        First AP appearance covering our &ldquo;Walt Disney on the $100 Bill&rdquo; story.{' '}
        <a href="https://apnews.com" target="_blank" rel="noopener noreferrer">Read the AP fact-check</a>.
      </>
    ),
  },
  {
    outlet: 'USA Today',
    description: (
      <>
        Two of our stories made the front of USA Today&apos;s fact-check desk: the{' '}
        &ldquo;Roller Coaster That Jumps the Track&rdquo; patent and our piece on Mickey
        Mouse being replaced. <a href="https://www.usatoday.com" target="_blank" rel="noopener noreferrer">Read the coverage</a>.
      </>
    ),
  },
  {
    outlet: 'Parents Magazine',
    description: (
      <>
        Parents covered our &ldquo;Cinderella Castle Being Destroyed&rdquo; story.{' '}
        <a href="https://www.parents.com" target="_blank" rel="noopener noreferrer">Read on parents.com</a>.
      </>
    ),
  },
  {
    outlet: 'Barstool Sports',
    description: (
      <>
        Barstool ran with our roller-coaster-jumps-the-track story. (Of course, they
        didn&apos;t give us credit for originating it&hellip;)
      </>
    ),
  },
  {
    outlet: 'PolitiFact',
    description: (
      <>
        PolitiFact covered our &ldquo;Mickey Mouse being replaced by Figment&rdquo; story.{' '}
        <a href="https://www.politifact.com" target="_blank" rel="noopener noreferrer">Read it on politifact.com</a>.
      </>
    ),
  },
  {
    outlet: 'Reuters',
    description: (
      <>
        Reuters covered our story about Mickey Mouse being replaced.{' '}
        <a href="https://www.reuters.com/fact-check" target="_blank" rel="noopener noreferrer">Read the Reuters fact-check</a>.
      </>
    ),
  },
  {
    outlet: 'Snopes',
    description: (
      <>
        We&apos;ve fooled Snopes into writing about us four times: Disney lowering the
        drinking age to 18, Cinderella Castle being destroyed, the Splash Mountain
        retheme being canceled, and the roller-coaster-jumps-the-track patent.{' '}
        <a href="https://www.snopes.com" target="_blank" rel="noopener noreferrer">See the Snopes coverage</a>.
      </>
    ),
  },
  {
    outlet: 'ABC 10 News San Diego',
    description: (
      <>
        ABC 10 News did a full segment on two of our stories: Disney lowering the
        drinking age from 21 to 18, and Disney drug-testing all guests.
      </>
    ),
  },
  {
    outlet: 'PBS',
    description: (
      <>
        PBS uses our content in classroom lesson plans about identifying satire.{' '}
        <a href="https://www.pbs.org" target="_blank" rel="noopener noreferrer">View the lesson plan</a>.
      </>
    ),
  },
]

export default function AboutPage() {
  return (
    <article className="static-page">
      <header className="static-page-hero">
        <div className="container">
          <span className="hero-badge">About</span>
          <h1 className="static-page-title">The Moused Trusted Name in Disney News</h1>
          <p className="static-page-subtitle">
            (That tagline is intentionally untrue. Most things on this site are.)
          </p>
        </div>
      </header>

      <div className="container static-page-body">
        <section className="static-section">
          <h2>What is Mouse Trap News?</h2>
          <p>
            Mouse Trap News is the world&apos;s best satire and parody site for Disney
            Parks news, and the home of <a href="https://www.amazon.com/Ultimate-Guide-Affordable-Disney-Trip/dp/1734191503" target="_blank" rel="noopener noreferrer">The Ultimate Guide to an Affordable Disney Trip</a>,
            a best-seller on Amazon.
          </p>
          <p>
            We write 100% made-up parody and satire stories about Disney Parks. Anything
            you read here is not true, real, or accurate &mdash; but it is fun. We started
            this site because we love Disney, we love a good joke, and we wanted to do
            something different from the deceptive clickbait that dominates the
            Disney-news space.
          </p>
          <p>
            If you enjoy our stories, please share them on social media and with your
            Disney friends. You can reach us anytime at{' '}
            <a href="mailto:themousetrapnews@gmail.com">themousetrapnews@gmail.com</a>.
          </p>
        </section>

        <section className="static-section">
          <h2>Who We Are</h2>
          <p>
            Mouse Trap News is run solely by our CEO, <strong>Michael Morrow</strong>.
            He is the author of every article you read and enjoy on our website. Michael
            has been featured in <a href="https://www.usatoday.com" target="_blank" rel="noopener noreferrer">USA Today</a>{' '}
            for his work on the site.
          </p>
          <p>
            Mr. Morrow has been to Walt Disney World more than 30 times and has no
            intentions to stop. With <strong>more than 500,000 followers</strong> across
            social media, you can follow Mouse Trap News on:
          </p>
          <ul className="static-social-list">
            <li><a href="https://www.tiktok.com/@mousetrapnews" target="_blank" rel="noopener noreferrer">TikTok &mdash; @mousetrapnews</a></li>
            <li><a href="https://www.instagram.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Instagram &mdash; @mousetrapnews</a></li>
            <li><a href="https://www.facebook.com/mousetrapnews/" target="_blank" rel="noopener noreferrer">Facebook &mdash; The Mouse Trap News</a></li>
            <li><a href="https://x.com/mousetrapnews" target="_blank" rel="noopener noreferrer">X / Twitter &mdash; @mousetrapnews</a></li>
          </ul>
          <p>
            For business or general inquiries:{' '}
            <a href="mailto:themousetrapnews@gmail.com">themousetrapnews@gmail.com</a>.
          </p>
        </section>

        <section className="static-section">
          <h2>As Featured On</h2>
          <p className="static-section-lede">
            Our stories have been picked up &mdash; and fact-checked &mdash; by some of the
            biggest names in news and entertainment.
          </p>
          <div className="press-list">
            {pressMentions.map((item) => (
              <div key={item.outlet} className="press-item">
                <h3>{item.outlet}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-cta">
          <h2>Ready for more?</h2>
          <p>Browse our latest totally-made-up Disney news.</p>
          <Link href="/" className="btn btn-glow">Read the latest stories</Link>
        </section>
      </div>
    </article>
  )
}
