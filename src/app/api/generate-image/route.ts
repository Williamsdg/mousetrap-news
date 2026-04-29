import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'

const STYLE_PROMPTS: Record<string, string> = {
  editorial:
    'Digital editorial illustration style, clean lines, professional magazine quality, vibrant colors, subtle gradients, modern and polished.',
  photorealistic:
    'Photorealistic, high resolution, natural lighting, shot on professional camera, editorial photography quality.',
  cartoon:
    'Colorful cartoon illustration, Disney-inspired animation style, fun and whimsical, clean vector art, bold outlines.',
  'vintage-poster':
    'Vintage travel poster style, retro 1950s aesthetic, bold typography areas, warm muted tones, art deco influence.',
  'park-photo':
    'Theme park photography style, golden hour lighting, crowds and atmosphere, immersive environment, tourist perspective.',
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your environment variables.' },
      { status: 503 }
    )
  }

  const { prompt, style = 'editorial' } = await request.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }

  const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.editorial
  const fullPrompt = `${prompt}. ${styleModifier} No text or watermarks in the image.`

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: fullPrompt,
        n: 1,
        size: '1536x1024',
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json(
        { error: err.error?.message || 'Image generation failed.' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const imageData = data.data?.[0]

    if (!imageData) {
      return NextResponse.json({ error: 'No image returned from API.' }, { status: 500 })
    }

    return NextResponse.json({
      image: imageData.b64_json
        ? `data:image/png;base64,${imageData.b64_json}`
        : imageData.url,
      revisedPrompt: imageData.revised_prompt,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred.' },
      { status: 500 }
    )
  }
}
