import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/write-client'

// Spam protection notes:
// - The form ships with a hidden "website" honeypot input. Real browsers
//   don't fill it in; bots that auto-fill every field do. If it arrives
//   non-empty, we silently 200 (don't tell the bot it failed) and skip
//   the write.
// - We capture the submitter IP for triage if a wave of garbage shows up.

const NAME_MAX = 60
const BODY_MAX = 2000

interface SubmitBody {
  articleId?: string
  parentId?: string
  firstName?: string
  lastName?: string
  body?: string
  anonymous?: boolean
  // Honeypot — must be empty
  website?: string
}

export async function POST(request: Request) {
  let payload: SubmitBody
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot — bots fill this; humans don't. Silent OK so we don't tip off bots.
  if (payload.website && payload.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const articleId = (payload.articleId || '').trim()
  const parentId = (payload.parentId || '').trim() || undefined
  const anonymous = !!payload.anonymous
  const firstName = anonymous ? '' : (payload.firstName || '').trim().slice(0, NAME_MAX)
  const lastName = anonymous ? '' : (payload.lastName || '').trim().slice(0, NAME_MAX)
  const body = (payload.body || '').trim().slice(0, BODY_MAX)

  if (!articleId) {
    return NextResponse.json({ error: 'Missing article reference.' }, { status: 400 })
  }
  if (!body) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 })
  }
  if (!anonymous && (!firstName || !lastName)) {
    return NextResponse.json(
      { error: 'Please enter your first and last name, or check the anonymous box.' },
      { status: 400 }
    )
  }

  // Verify the article actually exists (and is approved). Stops bots from
  // posting comments to invalid IDs and inflating the moderation queue.
  const article = await writeClient.fetch(
    `*[_id == $articleId && _type == "article" && status == "approved"][0]{_id}`,
    { articleId }
  )
  if (!article) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
  }

  // If a parent reply is supplied, sanity-check it points at an approved
  // comment on the same article. Prevents reply-injection across articles.
  if (parentId) {
    const parent = await writeClient.fetch(
      `*[_id == $parentId && _type == "comment" && status == "approved" && article._ref == $articleId][0]{_id}`,
      { parentId, articleId }
    )
    if (!parent) {
      return NextResponse.json({ error: 'Parent comment not found.' }, { status: 400 })
    }
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    ''

  try {
    await writeClient.create({
      _type: 'comment',
      article: { _type: 'reference', _ref: articleId },
      ...(parentId && { parent: { _type: 'reference', _ref: parentId } }),
      anonymous,
      firstName: anonymous ? undefined : firstName,
      lastName: anonymous ? undefined : lastName,
      body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submitterIp: ip || undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('comment submission failed', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
