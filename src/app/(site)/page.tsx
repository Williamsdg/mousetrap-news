export const revalidate = 60 // Revalidate every 60 seconds + on-demand via API

import Link from 'next/link'
import { client, urlFor } from '@/sanity/lib/client'
import { featuredArticleQuery, trendingArticlesQuery, latestArticlesQuery, categoriesQuery, siteSettingsQuery } from '@/sanity/lib/queries'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { asset: { _ref: string } }
  publishedAt: string
  category?: { title: string; slug: { current: string }; color?: string; icon?: string }
  author?: { name: string }
}

interface Category {
  _id: string
  title: string
  slug: { current: string }
  icon?: string
  color?: string
  image?: { asset: { _ref: string } }
  articleCount: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getCategoryTagClass(slug: string) {
  const map: Record<string, string> = {
    'magic-kingdom': 'category-tag',
    epcot: 'category-tag tag-epcot',
    'hollywood-studios': 'category-tag tag-studios',
    'animal-kingdom': 'category-tag tag-ak',
    resorts: 'category-tag tag-resorts',
    'cross-property': 'category-tag tag-cross',
    other: 'category-tag tag-other',
  }
  return map[slug] || 'category-tag'
}

export default async function HomePage() {
  const [featured, trending, latest, categories, settings] = await Promise.all([
    client.fetch<Article>(featuredArticleQuery),
    client.fetch<Article[]>(trendingArticlesQuery),
    client.fetch<Article[]>(latestArticlesQuery, { start: 0, end: 7 }),
    client.fetch<Category[]>(categoriesQuery),
    client.fetch(siteSettingsQuery),
  ])

  return (
    <>
      {/* HERO */}
      {featured && (
        <section className="hero">
          <div className="hero-bg">
            {featured.mainImage ? (
              <img
                src={urlFor(featured.mainImage).width(1600).quality(80).url()}
                alt={featured.title}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f0a2e, #2d1b69)' }} />
            )}
            <div className="hero-overlay" />
          </div>
          <div className="container hero-content">
            <div className="hero-badge">&#9889; Latest Viral Story</div>
            <h1 className="hero-title">{featured.title}</h1>
            {featured.excerpt && <p className="hero-excerpt">{featured.excerpt}</p>}
            <div className="hero-meta">
              {featured.category && (
                <span className="hero-category">{featured.category.title}</span>
              )}
              <span className="hero-date">{formatDate(featured.publishedAt)}</span>
            </div>
            <Link href={`/${featured.slug.current}`} className="btn btn-glow">
              Read the Full Story &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* FEATURED ON */}
      {settings?.featuredOnLogos && (
        <div className="featured-on">
          <div className="container featured-on-inner">
            <span className="featured-on-label">Fact-checked by the best (and they fell for it):</span>
            <div className="featured-on-logos">
              {settings.featuredOnLogos.map((logo: string) => (
                <span key={logo} className="featured-logo">{logo}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AD: LEADERBOARD */}
      <div className="ad-slot" style={{ background: 'var(--white)', borderBottom: '1px solid var(--light-gray)' }}>
        <div className="container">
          <div className="ad-placeholder">Advertisement — 728x90 Leaderboard</div>
        </div>
      </div>

      {/* TRENDING */}
      {trending && trending.length > 0 && (
        <section className="section trending-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">&#10024; Trending Stories</h2>
            </div>
            <div className="trending-grid">
              {trending.map((article, i) => (
                <article
                  key={article._id}
                  className={`trending-card ${i === 0 ? 'trending-card--large' : ''}`}
                >
                  <Link href={`/${article.slug.current}`} className="trending-card-link">
                    <div
                      className="trending-img"
                      style={{
                        backgroundImage: article.mainImage
                          ? `url(${urlFor(article.mainImage).width(800).quality(80).url()})`
                          : 'linear-gradient(135deg, #2d1b69, #0f0a2e)',
                      }}
                    >
                      <span className="trending-rank">#{i + 1}</span>
                    </div>
                    <div className="trending-info">
                      {article.category && (
                        <span className={getCategoryTagClass(article.category.slug.current)}>
                          {article.category.title}
                        </span>
                      )}
                      <h3>{article.title}</h3>
                      <span className="meta-date">{formatDate(article.publishedAt)}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LATEST POSTS + SIDEBAR */}
      <section className="section">
        <div className="container content-grid">
          <div>
            <div className="section-header">
              <h2 className="section-title">Latest Stories</h2>
            </div>
            {latest?.map((article) => (
              <article key={article._id} className="post-card">
                <Link
                  href={`/${article.slug.current}`}
                  className="post-card-img"
                  style={{
                    backgroundImage: article.mainImage
                      ? `url(${urlFor(article.mainImage).width(600).quality(80).url()})`
                      : 'linear-gradient(135deg, #2d1b69, #0f0a2e)',
                  }}
                />
                <div className="post-card-body">
                  {article.category && (
                    <span className={getCategoryTagClass(article.category.slug.current)}>
                      {article.category.title}
                    </span>
                  )}
                  <h3><Link href={`/${article.slug.current}`}>{article.title}</Link></h3>
                  {article.excerpt && <p className="post-excerpt">{article.excerpt}</p>}
                  <div className="post-meta">
                    <span className="meta-date">{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* SIDEBAR */}
          <aside>
            <div className="ad-slot" style={{ marginBottom: '2rem' }}>
              <div className="ad-placeholder" style={{ padding: '4rem 1.5rem' }}>Advertisement<br/>300x250</div>
            </div>

            <div className="sidebar-widget newsletter-widget" id="newsletter">
              <h3>Get the Fake News First</h3>
              <p>Join 50,000+ subscribers who get our best satire delivered straight to their inbox.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="your@email.com" required />
                <button type="submit" className="btn btn-glow">Subscribe</button>
              </form>
            </div>

            {categories && (
              <div className="sidebar-widget">
                <h3>Explore by Park</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {categories.map((cat) => (
                    <Link key={cat._id} href={`/category/${cat.slug.current}`} className="category-pill">
                      {cat.icon && <span>{cat.icon}</span>} {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section className="section newsletter-section">
        <div className="container newsletter-cta" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2>Don&apos;t Miss the Next Big (Fake) Story</h2>
          <p>Our satire has fooled the Associated Press, Reuters, and even Jimmy Fallon&apos;s writers. Get it in your inbox before everyone else shares it on Facebook thinking it&apos;s real.</p>
          <form className="newsletter-form" style={{ flexDirection: 'row', maxWidth: '480px', margin: '0 auto' }}>
            <input type="email" placeholder="your@email.com" required style={{ flex: 1 }} />
            <button type="submit" className="btn btn-glow">Subscribe Free &#10024;</button>
          </form>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      {categories && categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Explore by Park</h2>
            </div>
            <div className="categories-grid">
              {categories.filter(c => c.slug.current !== 'other').map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug.current}`}
                  className="category-card"
                  style={{
                    backgroundImage: cat.image
                      ? `url(${urlFor(cat.image).width(600).quality(80).url()})`
                      : 'linear-gradient(135deg, #2d1b69, #0f0a2e)',
                  }}
                >
                  <div className="category-card-overlay" />
                  <div className="category-card-content">
                    {cat.icon && <span className="category-card-icon">{cat.icon}</span>}
                    <h3>{cat.title}</h3>
                    <span className="category-card-count">{cat.articleCount} stories</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
