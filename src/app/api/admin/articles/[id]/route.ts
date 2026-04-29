import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSession, canChangeStatus, canDelete } from '@/lib/admin-auth'
// Admin reads use writeClient (no CDN) for fresh data
import { writeClient } from '@/sanity/lib/write-client'
import { generateExcerpt } from '@/lib/excerpt'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const article = await writeClient.fetch(`
    *[_type == "article" && _id == $id][0] {
      _id,
      title,
      slug,
      status,
      excerpt,
      mainImage,
      "mainImageUrl": mainImage.asset->url,
      publishedAt,
      submittedAt,
      approvedAt,
      approvedBy,
      reviewNotes,
      theme,
      featured,
      body,
      tags,
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
  // Auto-generate excerpt from body if excerpt is empty and body has content
  if (data.body !== undefined && (!data.excerpt || data.excerpt.trim() === '')) {
    patch.excerpt = generateExcerpt(data.body)
  }
  if (data.theme !== undefined) patch.theme = data.theme
  if (data.featured !== undefined) patch.featured = data.featured
  if (data.tags !== undefined) patch.tags = data.tags
  if (data.body !== undefined) patch.body = data.body
  if (data.publishedAt !== undefined) patch.publishedAt = data.publishedAt
  // mainImage is patched in two cases: the upload route already does it
  // for fresh uploads, but the image-library "Choose existing" flow goes
  // through this endpoint so we need to accept it here too.
  if (data.mainImage !== undefined) patch.mainImage = data.mainImage

  if (data.slug !== undefined) {
    patch.slug = { _type: 'slug', current: data.slug }
  }
  if (data.categoryId !== undefined) {
    patch.category = { _type: 'reference', _ref: data.categoryId }
  }
  if (data.authorId !== undefined) {
    patch.author = { _type: 'reference', _ref: data.authorId }
  }

  // Workflow status changes with permission check
  if (data.status !== undefined) {
    // Fetch current status to validate transition
    const current = await writeClient.fetch(`*[_type == "article" && _id == $id][0].status`, { id })
    if (!canChangeStatus(session.role, current || 'draft', data.status)) {
      return NextResponse.json({ error: 'You do not have permission to make this status change' }, { status: 403 })
    }
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

  // Revalidate site pages when status changes so approved articles appear immediately
  if (data.status !== undefined) {
    const slug = result.slug?.current
    revalidatePath('/')
    if (slug) revalidatePath(`/${slug}`)
  }

  return NextResponse.json({ article: result })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canDelete(session.role)) return NextResponse.json({ error: 'Only publishers can delete articles' }, { status: 403 })

  const { id } = await params
  await writeClient.delete(id)
  return NextResponse.json({ success: true })
}
