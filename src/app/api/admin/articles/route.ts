import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { client } from '@/sanity/lib/client'
import { writeClient } from '@/sanity/lib/write-client'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const filter = status ? `&& status == "${status}"` : ''
  const articles = await client.fetch(`
    *[_type == "article" ${filter}] | order(publishedAt desc) {
      _id,
      title,
      slug,
      status,
      excerpt,
      mainImage,
      publishedAt,
      submittedAt,
      approvedAt,
      approvedBy,
      reviewNotes,
      theme,
      featured,
      category->{_id, title, slug, icon, color},
      author->{_id, name}
    }
  `)

  return NextResponse.json({ articles })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()

  const doc = {
    _type: 'article',
    title: data.title,
    slug: { _type: 'slug', current: data.slug },
    excerpt: data.excerpt || '',
    status: 'draft',
    theme: data.theme || 'auto',
    featured: data.featured || false,
    publishedAt: data.publishedAt || new Date().toISOString(),
    category: data.categoryId ? { _type: 'reference', _ref: data.categoryId } : undefined,
    author: data.authorId ? { _type: 'reference', _ref: data.authorId } : undefined,
    body: data.body || [],
    tags: data.tags || [],
    aiImagePrompt: data.aiImagePrompt || '',
    aiImageStyle: data.aiImageStyle || 'editorial',
  }

  const result = await writeClient.create(doc)
  return NextResponse.json({ article: result })
}
