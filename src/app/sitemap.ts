import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

// Dynamic sitemap. Next.js auto-publishes this at /sitemap.xml. Pulls
// articles + categories from Sanity at request time so newly-published
// content appears within the route's revalidate window.
export const revalidate = 3600 // Re-fetch hourly

const SITE_URL = 'https://www.mousetrapnews.com'

interface ArticleEntry {
  slug: string
  publishedAt: string
}

interface CategoryEntry {
  slug: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categorySlugs] = await Promise.all([
    client.fetch<ArticleEntry[]>(`
      *[_type == "article" && status == "approved" && defined(slug.current)] {
        "slug": slug.current,
        publishedAt
      }
    `),
    client.fetch<string[]>(`
      *[_type == "category" && defined(slug.current)].slug.current
    `),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                lastModified: now, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${SITE_URL}/about`,           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/search`,          lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categorySlugs || []).map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const articleRoutes: MetadataRoute.Sitemap = (articles || [])
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${SITE_URL}/${a.slug}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes]
}
