import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0]

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '81uq8kg1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// Route image URLs through our Cloudflare Worker proxy instead of cdn.sanity.io
// directly. The worker is a pure host-swap that forwards /images/<proj>/<dataset>/...
// to cdn.sanity.io and caches the response at Cloudflare's edge for a year. Egress
// from Cloudflare is free, so repeat views never count against the Sanity bandwidth
// quota. Override with NEXT_PUBLIC_IMAGE_CDN_HOST if we ever swap CDNs.
const IMAGE_CDN_BASE =
  process.env.NEXT_PUBLIC_IMAGE_CDN_HOST ||
  'https://mousetrap-images.themousetrapnews.workers.dev'

const builder = createImageUrlBuilder(client).withOptions({ baseUrl: IMAGE_CDN_BASE })

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
