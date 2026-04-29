import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { writeClient } from '@/sanity/lib/write-client'

const PAGE_SIZE = 24

// Returns paginated image assets, with optional substring search across
// originalFilename and any alt text the asset has been used with on
// articles. Search is case-insensitive.
export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  // Build filter. Without a query we list everything newest-first.
  // With a query we match against the filename OR any alt text recorded
  // on articles that reference this asset.
  const queryParam = q ? `*${q.replace(/[*?\\]/g, '')}*` : ''

  const filterParts: string[] = ['_type == "sanity.imageAsset"']
  if (queryParam) {
    filterParts.push(
      `(originalFilename match $q || _id in *[_type == "article" && (mainImage.alt match $q || count(body[_type == "image" && alt match $q]) > 0)].mainImage.asset._ref)`
    )
  }
  const filter = filterParts.join(' && ')

  const groq = `
    {
      "total": count(*[${filter}]),
      "assets": *[${filter}] | order(_createdAt desc)[$start..$end] {
        _id,
        url,
        originalFilename,
        _createdAt,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height,
        "altUsedOnArticle": *[_type == "article" && mainImage.asset._ref == ^._id][0].mainImage.alt
      }
    }
  `

  try {
    const data = await writeClient.fetch(groq, { q: queryParam, start, end })
    return NextResponse.json({
      assets: data.assets || [],
      total: data.total || 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE)),
    })
  } catch (err) {
    console.error('image library fetch failed', err)
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 })
  }
}
