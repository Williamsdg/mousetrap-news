import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { writeClient } from '@/sanity/lib/write-client'

// GET /api/admin/comments?status=pending|approved
// Returns the comments matching the filter (or all if omitted), newest first,
// with the related article title + slug joined for context.
export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const filter = status ? `&& status == "${status}"` : ''

  const comments = await writeClient.fetch(`
    *[_type == "comment" ${filter}] | order(submittedAt desc) {
      _id,
      anonymous,
      firstName,
      lastName,
      body,
      status,
      submittedAt,
      approvedAt,
      submitterIp,
      "parent": parent->{ _id, body, firstName, lastName, anonymous },
      "article": article->{ _id, title, "slug": slug.current }
    }
  `)

  // Include the pending count for the dashboard badge in a single round-trip.
  const pendingCount = await writeClient.fetch(
    `count(*[_type == "comment" && status == "pending"])`
  )

  return NextResponse.json({ comments, pendingCount })
}
