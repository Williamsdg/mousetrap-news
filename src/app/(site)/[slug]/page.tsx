import { cache } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client, urlFor } from '@/sanity/lib/client'
import { articleBySlugQuery, relatedArticlesQuery, allArticleSlugsQuery } from '@/sanity/lib/queries'
import { resolveTheme, themes } from '@/components/theme/themes'
import ThemeWrapper from '@/components/theme/ThemeWrapper'

const getArticle = cache(async (slug: string) => {
  return client.fetch(articleBySlugQuery, { slug })
})

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(allArticleSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Article Not Found' }

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      images: article.seo?.ogImage
        ? [urlFor(article.seo.ogImage).width(1200).quality(80).url()]
        : article.mainImage
          ? [urlFor(article.mainImage).width(1200).quality(80).url()]
          : [],
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const portableTextComponents = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; caption?: string } }) => (
      <figure style={{ margin: '2rem 0' }}>
        <img
          src={urlFor(value).width(720).quality(80).url()}
          alt={value.caption || ''}
          style={{ borderRadius: 'var(--border-radius)', width: '100%' }}
        />
        {value.caption && (
          <figcaption style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--mid-gray)', marginTop: '0.5rem' }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    socialEmbed: ({ value }: { value: { platform: string; url: string; caption?: string } }) => (
      <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--cream)', borderRadius: 'var(--border-radius-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--mid-gray)' }}>
          {value.platform} embed: <a href={value.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--royal-purple)' }}>{value.url}</a>
        </p>
        {value.caption && <p style={{ fontSize: '0.8rem', color: 'var(--mid-gray)', marginTop: '0.5rem' }}>{value.caption}</p>}
      </div>
    ),
  },
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Article Not Found</h1>
        <p style={{ marginTop: '1rem', color: 'var(--mid-gray)' }}>This story doesn&apos;t exist. Unlike our other stories, which also don&apos;t exist.</p>
        <Link href="/" className="btn btn-glow" style={{ marginTop: '2rem' }}>Back to Home</Link>
      </div>
    )
  }

  const theme = resolveTheme(article.theme, slug)
  const related = article.category?._id
    ? await client.fetch(relatedArticlesQuery, { categoryId: article.category._id, articleId: article._id })
    : []

  return (
    <ThemeWrapper theme={theme}>
      {/* ARTICLE HERO */}
      <div style={{
        position: 'relative',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: article.mainImage
            ? `url(${urlFor(article.mainImage).width(1400).quality(80).url()})`
            : 'linear-gradient(135deg, var(--midnight), var(--royal-purple))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,10,46,0.95) 0%, rgba(15,10,46,0.6) 50%, rgba(15,10,46,0.2) 100%)',
          }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '6rem 1.5rem 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</Link>
            <span>/</span>
            {article.category && (
              <Link href={`/category/${article.category.slug.current}`} style={{ color: 'rgba(255,255,255,0.5)' }}>
                {article.category.title}
              </Link>
            )}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.8rem',
            fontWeight: 900,
            color: 'var(--white)',
            lineHeight: 1.15,
            maxWidth: '800px',
            marginBottom: '1.5rem',
          }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            {article.author && <span style={{ fontWeight: 600, color: 'var(--white)' }}>{article.author.name}</span>}
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <section className="section">
        <div className="container content-grid">
          <div>
            <div className="article-body">
              {article.body && (
                <PortableText value={article.body} components={portableTextComponents} />
              )}
            </div>

            {/* DISCLAIMER */}
            <div style={{
              background: 'var(--cream)',
              borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
              fontSize: '0.88rem',
              color: 'var(--dark-gray)',
              lineHeight: 1.6,
              marginTop: '3rem',
              borderLeft: '3px solid var(--mid-gray)',
            }}>
              <strong>Disclaimer:</strong> This article is satire. Mouse Trap News is a parody site. None of this is real.
            </div>

            {/* TAGS */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '2rem 0', borderTop: '1px solid var(--light-gray)', marginTop: '2rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid-gray)' }}>Topics:</span>
                {article.tags.map((tag: string) => (
                  <span key={tag} style={{ padding: '0.3rem 0.8rem', background: 'var(--cream)', borderRadius: '50px', fontSize: '0.8rem', color: 'var(--dark-gray)' }}>{tag}</span>
                ))}
              </div>
            )}

            {/* AUTHOR BOX */}
            {article.author && (
              <div style={{
                display: 'flex',
                gap: '2rem',
                padding: '2rem',
                background: 'var(--cream)',
                borderRadius: 'var(--border-radius-lg)',
                margin: '2rem 0',
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--royal-purple), var(--enchanted-teal))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--white)',
                  flexShrink: 0,
                }}>MTN</div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {article.author.name}
                  </h4>
                  {article.author.bio && <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', lineHeight: 1.6 }}>{article.author.bio}</p>}
                </div>
              </div>
            )}

            {/* RELATED POSTS */}
            {related && related.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>&#10024; You Might Also Enjoy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {related.map((rel: Article) => (
                    <Link key={rel._id} href={`/${rel.slug.current}`} style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{
                        height: '180px',
                        backgroundImage: rel.mainImage ? `url(${urlFor(rel.mainImage).width(400).quality(80).url()})` : 'linear-gradient(135deg, #2d1b69, #0f0a2e)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} />
                      <div style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.35 }}>{rel.title}</h4>
                        <span className="meta-date">{formatDate(rel.publishedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside>
            <div className="ad-slot" style={{ marginBottom: '2rem' }}>
              <div className="ad-placeholder" style={{ padding: '4rem 1.5rem' }}>Advertisement<br/>300x250</div>
            </div>
            <div className="sidebar-widget newsletter-widget">
              <h3>Get the Fake News First</h3>
              <p>Join 50,000+ subscribers who get our best satire delivered straight to their inbox.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="your@email.com" required />
                <button type="submit" className="btn btn-glow">Subscribe</button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* THEME INDICATOR (demo only) */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: 'var(--midnight)',
        color: 'var(--gold)',
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        fontSize: '0.75rem',
        fontWeight: 600,
        zIndex: 100,
        boxShadow: 'var(--shadow-lg)',
      }}>
        Theme: {theme.name}
      </div>
    </ThemeWrapper>
  )
}

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { asset: { _ref: string } }
  publishedAt: string
  theme?: string
  body?: unknown[]
  tags?: string[]
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: { asset: { _ref: string } } }
  category?: { _id: string; title: string; slug: { current: string }; color?: string; icon?: string }
  author?: { name: string; bio?: string; avatar?: { asset: { _ref: string } }; social?: Record<string, string> }
}
