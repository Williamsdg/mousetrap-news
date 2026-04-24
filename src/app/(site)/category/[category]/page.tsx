export const revalidate = 60

import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import CategoryBadge from '@/components/CategoryBadge'
import { client, urlFor } from '@/sanity/lib/client'
import { articlesByCategoryQuery, allCategorySlugsQuery } from '@/sanity/lib/queries'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { asset: { _ref: string } }
  publishedAt: string
  category?: { title: string; slug: { current: string }; color?: string }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(allCategorySlugsQuery)
  return slugs.map((category) => ({ category }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const catInfo = await client.fetch(
    `*[_type == "category" && slug.current == $category][0]{title, image}`,
    { category }
  )
  const title = catInfo?.title || category
  const description = `All satirical ${title} news from Mouse Trap News.`

  // Use category image from Sanity if available, otherwise fall back to site logo
  const ogImageUrl = catInfo?.image
    ? urlFor(catInfo.image).width(1200).height(630).quality(80).url()
    : '/og-default.png'

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Mouse Trap News`,
      description,
      type: 'website',
      siteName: 'Mouse Trap News',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} — Mouse Trap News`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mouse Trap News`,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  const [articles, catInfo] = await Promise.all([
    client.fetch<Article[]>(articlesByCategoryQuery, { category, start: 0, end: 19 }),
    client.fetch(`*[_type == "category" && slug.current == $category][0]{title, icon, color, description}`, { category }),
  ])

  return (
    <>
      {/* CATEGORY HERO */}
      <div style={{ overflow: 'hidden', borderRadius: 0 }}>
        <CategoryBadge title={catInfo?.title || category} color={catInfo?.color || '#2d1b69'} />
      </div>

      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--light-gray)' }}>
        <div className="container">
          <AdSlot type="leaderboard" />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{catInfo?.title || category} Stories</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--mid-gray)' }}>{articles.length} articles</span>
          </div>

          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--mid-gray)' }}>
              <p style={{ fontSize: '1.1rem' }}>No stories in this category yet.</p>
              <Link href="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Home</Link>
            </div>
          ) : (
            <div>
              {articles.map((article, index) => (
                <div key={article._id}>
                  {index > 0 && index % 3 === 0 && <AdSlot type="inline" />}
                  <article className="post-card">
                    <Link href={`/${article.slug.current}`} className="post-card-img">
                      {article.mainImage ? (
                        <img src={urlFor(article.mainImage).width(600).quality(80).url()} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2d1b69, #0f0a2e)' }} />
                      )}
                    </Link>
                    <div className="post-card-body">
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
          )}
        </div>
      </section>
    </>
  )
}
