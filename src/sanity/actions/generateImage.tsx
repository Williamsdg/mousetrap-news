import { useState, useCallback } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

export const generateImageAction: DocumentActionComponent = (props) => {
  const { draft, published, id } = props
  const doc = draft || published
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!doc) return

    const prompt = (doc as Record<string, unknown>).aiImagePrompt as string
    const style = ((doc as Record<string, unknown>).aiImageStyle as string) || 'editorial'
    const title = (doc as Record<string, unknown>).title as string

    const effectivePrompt = prompt || `Featured image for a satirical Disney news article titled: "${title}"`

    setIsGenerating(true)

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${origin}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: effectivePrompt, style }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Image generation failed: ${data.error}`)
        return
      }

      // Fetch the image and upload to Sanity assets
      const imageResponse = await fetch(data.image)
      const blob = await imageResponse.blob()

      const asset = await client.assets.upload('image', blob, {
        filename: `ai-generated-${id}.png`,
        contentType: 'image/png',
      })

      // Patch the document to set mainImage
      await client
        .patch(id)
        .set({
          mainImage: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          },
        })
        .commit()

      alert('Image generated and set as main image! Refresh to see it.')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }, [doc, client, id])

  if ((doc as Record<string, unknown>)?._type !== 'article') return null

  return {
    label: isGenerating ? 'Generating...' : 'Generate AI Image',
    icon: () => <span style={{ fontSize: '1.2em' }}>🎨</span>,
    disabled: isGenerating,
    onHandle: handleGenerate,
  }
}
