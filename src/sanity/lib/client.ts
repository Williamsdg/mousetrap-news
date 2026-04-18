import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0]

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
