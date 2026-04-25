import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ alt: '' })
  }

  const { imageUrl } = await request.json()
  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Write a single short alt-text description (under 120 chars) for this image, suitable for a Disney parody news article. Describe what is visible factually. No quotes, no preamble, just the description.',
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 80,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ alt: '' })
    }

    const data = await res.json()
    const alt = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || ''
    return NextResponse.json({ alt })
  } catch {
    return NextResponse.json({ alt: '' })
  }
}
