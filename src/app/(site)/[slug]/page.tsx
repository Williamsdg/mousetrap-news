export const revalidate = 60
export const dynamicParams = true // Allow on-demand generation of slugs not in generateStaticParams

import { cache } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client, urlFor } from '@/sanity/lib/client'
import { articleBySlugQuery, relatedArticlesQuery } from '@/sanity/lib/queries'
import { resolveTheme } from '@/components/theme/themes'
import ThemeWrapper from '@/components/theme/ThemeWrapper'
import AdSlot from '@/components/AdSlot'
// ArticleWithAds removed — inline ads now rendered server-side

const getArticle = cache(async (slug: string) => {
  return client.fetch(articleBySlugQuery, { slug })
})

// Pre-render only the 25 most recent articles at build time to avoid Sanity API rate limits.
// All other articles will be generated on-demand on first visit and cached via ISR.
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(`
    *[_type == "article" && status == "approved" && defined(slug.current)]
      | order(publishedAt desc)[0..24].slug.current
  `)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Article Not Found' }

  const title = article.seo?.metaTitle || article.title
  const description = article.seo?.metaDescription || article.excerpt

  // Prefer article SEO image > mainImage > site default
  const ogImageUrl = article.seo?.ogImage
    ? urlFor(article.seo.ogImage).width(1200).height(630).quality(80).url()
    : article.mainImage
      ? urlFor(article.mainImage).width(1200).height(630).quality(80).url()
      : '/og-default.png'

  return {
    title,
    description,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      siteName: 'Mouse Trap News',
      publishedTime: article.publishedAt,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

const portableTextComponents = {
  marks: {
    footnote: ({ children, value }: { children: React.ReactNode; value?: { text?: string } }) => (
      <span title={value?.text || ''} style={{
        background: 'rgba(45,27,105,0.08)',
        borderBottom: '1px dotted var(--royal-purple)',
        padding: '0 2px',
        cursor: 'help',
      }}>
        {children}
        <sup style={{ color: 'var(--royal-purple)', fontWeight: 700, fontSize: '0.75em', marginLeft: '1px' }}>*</sup>
      </span>
    ),
  },
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; caption?: string; alt?: string; alignment?: string; size?: string } }) => {
      const alignment = value.alignment || 'full'
      const size = value.size || 'large'
      const widthPx = size === 'small' ? 320 : size === 'medium' ? 560 : 1080
      const figureStyle: React.CSSProperties = { margin: '2rem 0' }
      if (alignment === 'left') {
        figureStyle.float = 'left'
        figureStyle.maxWidth = `${widthPx}px`
        figureStyle.margin = '0.5rem 1.5rem 1rem 0'
      } else if (alignment === 'right') {
        figureStyle.float = 'right'
        figureStyle.maxWidth = `${widthPx}px`
        figureStyle.margin = '0.5rem 0 1rem 1.5rem'
      } else if (alignment === 'center') {
        figureStyle.maxWidth = `${widthPx}px`
        figureStyle.marginLeft = 'auto'
        figureStyle.marginRight = 'auto'
      } else if (size !== 'large') {
        figureStyle.maxWidth = `${widthPx}px`
      }
      return (
        <figure style={figureStyle}>
          <img
            src={urlFor(value).width(widthPx).quality(80).url()}
            alt={value.alt || value.caption || ''}
            style={{ borderRadius: 'var(--border-radius)', width: '100%', display: 'block' }}
          />
          {value.caption && (
            <figcaption style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--mid-gray)', marginTop: '0.5rem' }}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    socialEmbed: ({ value }: { value: { platform: string; url: string; caption?: string } }) => (
      <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--cream)', borderRadius: 'var(--border-radius-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--mid-gray)' }}>
          {value.platform} embed: <a href={value.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--royal-purple)' }}>{value.url}</a>
        </p>
        {value.caption && <p style={{ fontSize: '0.8rem', color: 'var(--mid-gray)', marginTop: '0.5rem' }}>{value.caption}</p>}
      </div>
    ),
    youtubeEmbed: ({ value }: { value: { url: string; caption?: string } }) => {
      const id = youtubeIdFromUrl(value.url || '')
      if (!id) return null
      return (
        <figure style={{ margin: '2rem 0' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={value.caption || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
          {value.caption && (
            <figcaption style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--mid-gray)', marginTop: '0.5rem' }}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    tableBlock: ({ value }: { value: { rows?: Array<{ cells?: string[] }>; hasHeader?: boolean } }) => {
      const rows = value.rows || []
      if (rows.length === 0) return null
      const hasHeader = value.hasHeader !== false
      return (
        <div style={{ margin: '2rem 0', overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.95rem' }}>
            <tbody>
              {rows.map((row, i) => {
                const Cell = hasHeader && i === 0 ? 'th' : 'td'
                return (
                  <tr key={i}>
                    {(row.cells || []).map((cell, j) => (
                      <Cell key={j} style={{
                        border: '1px solid var(--light-gray)',
                        padding: '0.6rem 0.85rem',
                        textAlign: 'left',
                        background: hasHeader && i === 0 ? 'var(--cream)' : 'transparent',
                        fontWeight: hasHeader && i === 0 ? 700 : 400,
                      }}>
                        {cell}
                      </Cell>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    },
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

  const theme = resolveTheme(article.theme, slug, article.category?.slug?.current)
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
        <div style={{ position: 'absolute', inset: 0 }}>
          {article.mainImage ? (
            <img
              src={urlFor(article.mainImage).width(1600).quality(80).url()}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--midnight), var(--royal-purple))' }} />
          )}
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
          <h1 className="article-page-title" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            color: 'var(--white)',
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

      {/* AD: LEADERBOARD BELOW HERO */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--light-gray)' }}>
        <div className="container">
          <AdSlot type="leaderboard" />
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <section className="section">
        <div className="container content-grid">
          <div>
            <div className="article-body">
              {article.body && (() => {
                // Split body into chunks and insert ads between them
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const blocks = article.body as any[]
                // Insert ads every 3-4 blocks, ensuring at least 2-3 ads per article
                const totalBlocks = blocks.length
                const adAfterBlock: number[] = []
                if (totalBlocks >= 4) adAfterBlock.push(2) // After 3rd block
                if (totalBlocks >= 7) adAfterBlock.push(5) // After 6th block
                if (totalBlocks >= 10) adAfterBlock.push(8) // After 9th block
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chunks: any[][] = []
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let current: any[] = []

                blocks.forEach((block, i) => {
                  current.push(block)
                  if (adAfterBlock.includes(i) && i < blocks.length - 1) {
                    chunks.push(current)
                    current = []
                  }
                })
                if (current.length > 0) chunks.push(current)

                return chunks.map((chunk, i) => (
                  <div key={i}>
                    <PortableText value={chunk} components={portableTextComponents} />
                    {i < chunks.length - 1 && <AdSlot type="inline" />}
                  </div>
                ))
              })()}
            </div>

            {/* AD: BELOW ARTICLE BODY */}
            <AdSlot type="leaderboard" />

            {/* MID-ARTICLE NEWSLETTER */}
            <div style={{
              background: 'linear-gradient(135deg, var(--midnight), var(--royal-purple))',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2.5rem',
              color: 'var(--white)',
              margin: '2rem 0',
              textAlign: 'center',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Enjoying this totally real story?
              </h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Get the best fake Disney news delivered to your inbox. Trusted by 50,000+ people who should know better.
              </p>
              <form style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
                <input type="email" placeholder="your@email.com" required style={{
                  flex: 1, padding: '0.75rem 1rem', border: '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)', borderRadius: '50px', color: 'var(--white)',
                  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
                }} />
                <button type="submit" className="btn btn-glow">Subscribe</button>
              </form>
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

            {/* AD: BETWEEN AUTHOR AND RELATED */}
            <AdSlot type="leaderboard" />

            {/* RELATED POSTS */}
            {related && related.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>&#10024; You Might Also Enjoy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {related.map((rel: Article) => (
                    <Link key={rel._id} href={`/${rel.slug.current}`} style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        {rel.mainImage ? (
                          <img src={urlFor(rel.mainImage).width(400).quality(80).url()} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2d1b69, #0f0a2e)' }} />
                        )}
                      </div>
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
            {/* AD: Sidebar top 300x250 */}
            <AdSlot type="sidebar" />

            {/* NEWSLETTER */}
            <div className="sidebar-widget newsletter-widget">
              <h3>Get the Fake News First</h3>
              <p>Join 50,000+ subscribers who get our best satire delivered straight to their inbox.</p>
              <form className="newsletter-form">
                <input type="email" placeholder="your@email.com" required />
                <button type="submit" className="btn btn-glow">Subscribe</button>
              </form>
            </div>

            {/* AD: Sidebar mid 300x250 */}
            <AdSlot type="sidebar" />

            {/* AD: Sidebar sticky 300x600 */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <AdSlot type="sidebar-tall" />
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
