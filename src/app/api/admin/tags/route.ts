import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { writeClient } from '@/sanity/lib/write-client'

// Returns the deduped, normalized list of every tag used across articles.
// Used by the admin Tags input to autocomplete as Michael types — same
// behavior he had in WordPress.
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pull every non-empty tag string across all articles. GROQ flattens
  // arrays automatically when you path through them, then `unique` dedupes.
  const tags = await writeClient.fetch<string[]>(
    `array::unique(*[_type == "article" && defined(tags)].tags[])`
  )

  // Normalize: trim, drop falsy, sort case-insensitively for nicer UX.
  const cleaned = (tags || [])
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean)
  const deduped = Array.from(new Set(cleaned))
  deduped.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  return NextResponse.json({ tags: deduped })
}
