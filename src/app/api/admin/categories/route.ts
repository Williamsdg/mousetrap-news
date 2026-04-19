import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { client } from '@/sanity/lib/client'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await client.fetch(`
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      icon,
      color,
      description,
      "articleCount": count(*[_type == "article" && references(^._id)])
    }
  `)

  return NextResponse.json({ categories })
}
