import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/admin-auth'
import { writeClient } from '@/sanity/lib/write-client'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const articleId = formData.get('articleId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    })

    // If articleId provided, set as mainImage on the article
    if (articleId) {
      const result = await writeClient.patch(articleId).set({
        mainImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      }).commit()

      // Revalidate site pages
      revalidatePath('/')
      const slug = result.slug?.current
      if (slug) revalidatePath(`/${slug}`)
    }

    return NextResponse.json({
      asset: {
        _id: asset._id,
        url: asset.url,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
