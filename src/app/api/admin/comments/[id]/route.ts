import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/admin-auth'
import { writeClient } from '@/sanity/lib/write-client'

// PATCH /api/admin/comments/[id]  body: { action: 'approve' }
// DELETE /api/admin/comments/[id]
//
// Approve flips status to "approved" and stamps approvedAt. Reject deletes
// the doc entirely (Michael's preference — no audit trail). Both actions
// invalidate the parent article's ISR cache so the public comment thread
// updates within the next request.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const action = body.action

  if (action !== 'approve') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  }

  // Pull the comment + its article slug so we can revalidate the article page.
  const existing = await writeClient.fetch(
    `*[_id == $id && _type == "comment"][0]{
      _id,
      "articleSlug": article->slug.current
    }`,
    { id }
  )
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await writeClient
    .patch(id)
    .set({ status: 'approved', approvedAt: new Date().toISOString() })
    .commit()

  if (existing.articleSlug) revalidatePath(`/${existing.articleSlug}`)

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await writeClient.fetch(
    `*[_id == $id && _type == "comment"][0]{
      _id,
      "articleSlug": article->slug.current,
      "replyIds": *[_type == "comment" && parent._ref == ^._id]._id
    }`,
    { id }
  )
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // If this is a top-level comment, also delete any replies — without their
  // parent the replies become orphaned (the GROQ public query depends on
  // !defined(parent) for top-level comments and parent._ref == ^._id for
  // replies, so an orphaned reply would never render).
  const replyIds: string[] = existing.replyIds || []
  if (replyIds.length > 0) {
    const tx = writeClient.transaction()
    for (const rid of replyIds) tx.delete(rid)
    tx.delete(id)
    await tx.commit()
  } else {
    await writeClient.delete(id)
  }

  if (existing.articleSlug) revalidatePath(`/${existing.articleSlug}`)

  return NextResponse.json({ ok: true })
}
