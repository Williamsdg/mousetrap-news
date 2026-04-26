export const revalidate = 60 // Revalidate every 60 seconds + on-demand via API

import type { Metadata } from 'next'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import CategoryBadge from '@/components/CategoryBadge'
import { client, urlFor } from '@/sanity/lib/client'

export const metadata: Metadata = {
  title: 'Mouse Trap News — The Moused Trusted Name in Disney News',
  description: 'The world\'s best satire and parody site for Disney Parks news. Totally made up. Completely hilarious.',
  openGraph: {
    siteName: 'Mouse Trap News',
    type: 'website',
    title: 'Mouse Trap News — The Moused Trusted Name in Disney News',
    description: 'The world\'s best satire and parody site for Disney Parks news.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Mouse Trap News — The Moused Trusted Name in Disney News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mouse Trap News',
    description: 'The Moused Trusted Name in Disney News.',
    images: ['/og-default.png'],
  },
}
import { featuredArticleQuery, latestArticlesQuery, categoriesQuery, siteSettingsQuery } from '@/sanity/lib/queries'
import { getTrendingArticles } from '@/sanity/lib/trending'

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
    getTrendingArticles(),
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

      {/* AD: LEADERBOARD (above the fold — eager) */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--light-gray)' }}>
        <div className="container">
          <AdSlot type="leaderboard" eager />
        </div>
      </div>

      {/* TRENDING — editorial 1+4 layout. The lead story takes the full
          left column with title overlaid on a darkened hero image; the
          other four sit in a list rail on the right. Visual contrast
          between #1 and the rest tells the "ranking" story without
          relying on a small numeric pill. */}
      {trending && trending.length > 0 && (() => {
        const lead = trending[0]
        const rest = trending.slice(1, 5)
        return (
          <section className="section trending-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">What People Are Reading Right Now</h2>
              </div>
              <div className="trending-editorial">
                {/* LEAD #1 — image dominant with title overlay */}
                <Link href={`/${lead.slug.current}`} className="trending-lead">
                  <div className="trending-lead__bg">
                    {lead.mainImage ? (
                      <img
                        src={urlFor(lead.mainImage).width(1200).quality(80).url()}
                        alt={lead.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2d1b69, #0f0a2e)' }} />
                    )}
                    <div className="trending-lead__overlay" aria-hidden="true" />
                  </div>
                  <div className="trending-lead__content">
                    <span className="trending-lead__rank">#1 Most Read</span>
                    {lead.category && (
                      <span className={`${getCategoryTagClass(lead.category.slug.current)} trending-lead__tag`}>
                        {lead.category.title}
                      </span>
                    )}
                    <h3 className="trending-lead__title">{lead.title}</h3>
                    {lead.excerpt && (
                      <p className="trending-lead__excerpt">{lead.excerpt}</p>
                    )}
                    <span className="trending-lead__date">{formatDate(lead.publishedAt)}</span>
                  </div>
                </Link>

                {/* RAIL #2-#5 — compact horizontal list rows */}
                <ol className="trending-rail">
                  {rest.map((article, i) => (
                    <li key={article._id} className="trending-row">
                      <Link href={`/${article.slug.current}`} className="trending-row__link">
                        <span className="trending-row__rank">{i + 2}</span>
                        <div className="trending-row__thumb">
                          {article.mainImage ? (
                            <img
                              src={urlFor(article.mainImage).width(240).quality(80).url()}
                              alt={article.title}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2d1b69, #0f0a2e)' }} />
                          )}
                        </div>
                        <div className="trending-row__body">
                          {article.category && (
                            <span className={getCategoryTagClass(article.category.slug.current)}>
                              {article.category.title}
                            </span>
                          )}
                          <h4 className="trending-row__title">{article.title}</h4>
                          <span className="trending-row__date">{formatDate(article.publishedAt)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )
      })()}

      {/* AD: BETWEEN TRENDING AND LATEST */}
      <div style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <AdSlot type="leaderboard" />
        </div>
      </div>

      {/* LATEST POSTS + SIDEBAR */}
      <section className="section">
        <div className="container content-grid">
          <div>
            <div className="section-header">
              <h2 className="section-title">Latest Stories</h2>
            </div>
            {latest?.map((article, index) => (
              <div key={article._id}>
                {/* In-feed ad every 4 posts — too dense if every 2 */}
                {index > 0 && index % 4 === 0 && <AdSlot type="inline" />}
              <article className="post-card">
                <Link href={`/${article.slug.current}`} className="post-card-img">
                  {article.mainImage ? (
                    <img src={urlFor(article.mainImage).width(600).quality(80).url()} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2d1b69, #0f0a2e)' }} />
                  )}
                </Link>
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
              </div>
            ))}
          </div>

          {/* SIDEBAR */}
          <aside>
            {/* AD: Sidebar top */}
            <AdSlot type="sidebar" />

            {/* AD: Sidebar sticky */}
            <div className="sidebar-sticky-ad">
              <AdSlot type="sidebar-tall" />
            </div>
          </aside>
        </div>
      </section>

      {/* AD: BEFORE CATEGORIES */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--light-gray)' }}>
        <div className="container">
          <AdSlot type="leaderboard" />
        </div>
      </div>

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
                  style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', display: 'block', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: 'var(--shadow-sm)' }}
                >
                  <CategoryBadge title={cat.title} color={cat.color || '#2d1b69'} />
                  <div style={{ background: 'var(--white)', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--mid-gray)' }}>{cat.articleCount} stories</span>
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
