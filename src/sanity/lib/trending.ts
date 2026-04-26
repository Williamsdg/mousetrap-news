// Trending-articles fetcher.
//
// Priority: ask Google Analytics 4 for the most-viewed article slugs in the
// last 7 days, then look those slugs up in Sanity. If GA4 isn't configured
// yet (env vars missing), the call fails, or it returns fewer than 5 hits,
// gracefully top up the list with the newest approved articles so the
// trending row never looks empty or partially broken.
//
// Result is cached for 30 minutes via unstable_cache so we don't hammer the
// GA4 Data API on every homepage render — GA4's free quota is 10k requests
// per property per day.

import { unstable_cache } from 'next/cache'
import { client } from './client'
import { trendingArticlesQuery } from './queries'

const TRENDING_WINDOW_DAYS = 7
const TRENDING_LIMIT = 5
const CACHE_SECONDS = 60 * 30 // 30 minutes

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: { asset: { _ref: string } }
  publishedAt: string
  theme?: string
  category?: { title: string; slug: { current: string }; color?: string; icon?: string }
}

// Lazily load the GA4 client only when env vars are present.
// Importing @google-analytics/data eagerly would hit module init even on
// builds where GA4 isn't configured.
async function fetchTopSlugsFromGA4(): Promise<string[] | null> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_KEY

  if (!propertyId || !credentialsJson) return null

  let credentials: { client_email?: string; private_key?: string }
  try {
    credentials = JSON.parse(credentialsJson)
  } catch {
    console.warn('[trending] GA4_SERVICE_ACCOUNT_KEY is not valid JSON')
    return null
  }

  if (!credentials.client_email || !credentials.private_key) {
    console.warn('[trending] GA4_SERVICE_ACCOUNT_KEY missing client_email or private_key')
    return null
  }

  try {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        // GA4 SDK requires real newlines in the private key — env vars
        // typically store them escaped, so unescape here.
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      },
    })

    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${TRENDING_WINDOW_DAYS}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 50, // Pull extra so we can filter out non-article paths
    })

    const rows = response.rows || []
    const slugs: string[] = []
    for (const row of rows) {
      const path = row.dimensionValues?.[0]?.value || ''
      // Article URLs on this site are /<slug> at the root. Skip homepage,
      // category pages, search, and the static About/Contact/Privacy pages.
      const m = path.match(/^\/([^/?#]+)\/?$/)
      if (!m) continue
      const slug = m[1]
      if (['about', 'contact', 'privacy-policy', 'search', 'studio'].includes(slug)) continue
      if (!slugs.includes(slug)) slugs.push(slug)
      if (slugs.length >= TRENDING_LIMIT) break
    }
    return slugs
  } catch (err) {
    console.warn('[trending] GA4 fetch failed:', err instanceof Error ? err.message : err)
    return null
  }
}

async function fetchArticlesBySlugsPreservingOrder(slugs: string[]): Promise<Article[]> {
  if (slugs.length === 0) return []
  // GROQ doesn't support ordering by an arbitrary slug list, so fetch all
  // matches and re-sort in JS to honor the GA4 ranking.
  const articles = await client.fetch<Article[]>(
    `*[_type == "article" && status == "approved" && slug.current in $slugs] {
      _id, title, slug, excerpt, mainImage, publishedAt, theme,
      category->{title, slug, color, icon}
    }`,
    { slugs }
  )
  const order = new Map(slugs.map((s, i) => [s, i]))
  return articles.sort((a, b) => (order.get(a.slug.current) ?? 999) - (order.get(b.slug.current) ?? 999))
}

async function fetchNewestApproved(limit: number, excludeIds: Set<string>): Promise<Article[]> {
  // Pull a few extra so we can filter out IDs already in the trending list.
  const extra = await client.fetch<Article[]>(trendingArticlesQuery)
  return extra.filter((a) => !excludeIds.has(a._id)).slice(0, limit)
}

async function getTrendingArticlesUncached(): Promise<Article[]> {
  const ga4Slugs = await fetchTopSlugsFromGA4()
  let articles: Article[] = []

  if (ga4Slugs && ga4Slugs.length > 0) {
    articles = await fetchArticlesBySlugsPreservingOrder(ga4Slugs)
  }

  // Top up with newest approved articles if GA4 returned fewer than 5
  // (or returned nothing, or wasn't configured). Excludes anything already
  // in the GA4 list so we don't duplicate.
  if (articles.length < TRENDING_LIMIT) {
    const have = new Set(articles.map((a) => a._id))
    const filler = await fetchNewestApproved(TRENDING_LIMIT - articles.length, have)
    articles = [...articles, ...filler]
  }

  return articles.slice(0, TRENDING_LIMIT)
}

export const getTrendingArticles = unstable_cache(
  getTrendingArticlesUncached,
  ['trending-articles-v1'],
  { revalidate: CACHE_SECONDS, tags: ['trending'] }
)
