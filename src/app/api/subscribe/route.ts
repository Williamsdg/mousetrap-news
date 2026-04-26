import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/write-client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  let body: { email?: string; source?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const source = (body.source || 'footer').slice(0, 60)

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    // Idempotent: if this email is already on the list, no-op (don't 500
    // and don't reveal "already subscribed" messaging since the form is
    // public). Use a deterministic _id keyed on the email so re-submits
    // overwrite the same doc instead of creating duplicates.
    const id = `subscriber-${email.replace(/[^a-z0-9]/g, '-').slice(0, 50)}`

    const existing = await writeClient.fetch(`*[_id == $id][0]{_id}`, { id })

    if (!existing) {
      await writeClient.create({
        _id: id,
        _type: 'subscriber',
        email,
        source,
        subscribedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('subscribe failed', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
