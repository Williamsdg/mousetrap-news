export const revalidate = 60

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { client, urlFor } from '@/sanity/lib/client'
import {
  searchArticlesQuery,
  searchArticlesCountQuery,
  categoriesQuery,
} from '@/sanity/lib/queries'
import SearchForm from '@/components/SearchForm'

const PAGE_SIZE = 20

interface SearchArticle {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { asset: { _ref: string } }
  publishedAt: string
  category?: { title: string; slug: { current: string }; color?: string; icon?: string }
}

interface CategoryOption {
  _id: string
  title: string
  slug: { current: string }
  icon?: string
}

export const metadata: Metadata = {
  title: 'Search — Mouse Trap News',
  description: 'Search every totally-fake Disney story we\'ve ever published. Filter by category or keyword.',
  robots: { index: false, follow: true },
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const rawQ = (params.q || '').trim()
  const category = (params.category || '').trim()
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  // GROQ `match` requires non-empty token; wrap in *…* so it acts as a substring
  // match on the title. Empty string is handled by the query branch.
  const groqQ = rawQ ? `*${rawQ.replace(/[*?]/g, '')}*` : ''

  const [results, total, categories] = await Promise.all([
    client.fetch<SearchArticle[]>(searchArticlesQuery, { q: groqQ, category, start, end }),
    client.fetch<number>(searchArticlesCountQuery, { q: groqQ, category }),
    client.fetch<CategoryOption[]>(categoriesQuery),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = rawQ.length > 0 || category.length > 0

  return (
    <article className="static-page">
      <header className="static-page-hero">
        <div className="container">
          <span className="hero-badge">Search</span>
          <h1 className="static-page-title">Find a Story</h1>
          <p className="static-page-subtitle">
            Every made-up Disney headline we&apos;ve ever published. Filter by category or search by keyword.
          </p>
        </div>
      </header>

      <div className="container">
        <SearchForm
          initialQ={rawQ}
          initialCategory={category}
          categories={categories.map((c) => ({ slug: c.slug.current, title: c.title, icon: c.icon }))}
        />

        {hasFilters && (
          <p className="search-result-count">
            {total === 0
              ? 'No matches found.'
              : `${total.toLocaleString()} result${total === 1 ? '' : 's'}${rawQ ? ` for "${rawQ}"` : ''}${category ? ` in ${categories.find((c) => c.slug.current === category)?.title || category}` : ''}.`}
          </p>
        )}

        {!hasFilters && (
          <p className="search-result-count">
            Use the box above to search. Tip: short keywords work better than full sentences.
          </p>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {results.map((article) => (
              <article key={article._id} className="post-card">
                <Link href={`/${article.slug.current}`} className="post-card-img">
                  {article.mainImage ? (
                    <Image
                      src={urlFor(article.mainImage).width(600).quality(80).url()}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                      style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                    />
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
                  <h3>
                    <Link href={`/${article.slug.current}`}>{article.title}</Link>
                  </h3>
                  {article.excerpt && <p className="post-excerpt">{article.excerpt}</p>}
                  <div className="post-meta">
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="search-pagination" aria-label="Search results pagination">
            {page > 1 && (
              <Link
                href={`/search?${new URLSearchParams({ ...(rawQ && { q: rawQ }), ...(category && { category }), page: String(page - 1) }).toString()}`}
                className="btn btn-outline btn-sm"
              >
                ← Previous
              </Link>
            )}
            <span className="search-pagination-info">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/search?${new URLSearchParams({ ...(rawQ && { q: rawQ }), ...(category && { category }), page: String(page + 1) }).toString()}`}
                className="btn btn-outline btn-sm"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  )
}
