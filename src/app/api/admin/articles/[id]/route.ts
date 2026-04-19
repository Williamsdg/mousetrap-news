import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { client } from '@/sanity/lib/client'
import { writeClient } from '@/sanity/lib/write-client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const article = await client.fetch(`
    *[_type == "article" && _id == $id][0] {
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
      body,
      tags,
      aiImagePrompt,
      aiImageStyle,
      category->{_id, title},
      author->{_id, name}
    }
  `, { id })

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ article })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  const patch: Record<string, unknown> = {}

  if (data.title !== undefined) patch.title = data.title
  if (data.excerpt !== undefined) patch.excerpt = data.excerpt
  if (data.theme !== undefined) patch.theme = data.theme
  if (data.featured !== undefined) patch.featured = data.featured
  if (data.tags !== undefined) patch.tags = data.tags
  if (data.body !== undefined) patch.body = data.body
  if (data.aiImagePrompt !== undefined) patch.aiImagePrompt = data.aiImagePrompt
  if (data.aiImageStyle !== undefined) patch.aiImageStyle = data.aiImageStyle
  if (data.publishedAt !== undefined) patch.publishedAt = data.publishedAt

  if (data.slug !== undefined) {
    patch.slug = { _type: 'slug', current: data.slug }
  }
  if (data.categoryId !== undefined) {
    patch.category = { _type: 'reference', _ref: data.categoryId }
  }
  if (data.authorId !== undefined) {
    patch.author = { _type: 'reference', _ref: data.authorId }
  }

  // Workflow status changes
  if (data.status !== undefined) {
    patch.status = data.status

    if (data.status === 'in-review') {
      patch.submittedAt = new Date().toISOString()
    }
    if (data.status === 'approved') {
      patch.approvedAt = new Date().toISOString()
      patch.approvedBy = session.name
    }
    if (data.status === 'rejected') {
      patch.reviewNotes = data.reviewNotes || ''
    }
  }

  const result = await writeClient.patch(id).set(patch).commit()
  return NextResponse.json({ article: result })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await writeClient.delete(id)
  return NextResponse.json({ success: true })
}
