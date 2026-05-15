import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    // Cache optimized images for 31 days. Default is 4h, which means Vercel's
    // image optimizer re-fetches Sanity images far more often than needed —
    // each re-fetch counts toward the Sanity bandwidth quota. 31d cache cuts
    // re-fetches dramatically without changing user experience (Sanity image
    // URLs include the asset hash, so a swapped image gets a new URL anyway).
    minimumCacheTTL: 2678400,
    // Next.js 16 requires the quality values used in the codebase to be
    // explicitly allowlisted. We use 70 (most cards/thumbnails), 75 (heroes),
    // and pass through whatever quality(N) is encoded into the Sanity URL.
    qualities: [70, 75, 80],
  },
  async headers() {
    // Aggressive cache on static brand assets — favicons, OG image, logos.
    // These never change without a name change, so we tell every layer
    // (browser, Vercel edge, CDN) to cache them for a year. This protects
    // against bot bursts: when a scraper hammers /favicon.ico 5,000 times
    // in a 3-minute window, every hit after the first is a 304 served from
    // edge cache with zero origin compute and ~0 bytes egress.
    const yearLong = 'public, max-age=31536000, immutable'
    return [
      { source: '/favicon.ico',         headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/favicon-:size.png',   headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/apple-touch-icon.png',headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/og-default.png',      headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/logo.png',            headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/logo-oneline.png',    headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/logo-stacked.png',    headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/icon.png',            headers: [{ key: 'Cache-Control', value: yearLong }] },
      { source: '/ads.txt',             headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/robots.txt',          headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
    ]
  },
};

export default nextConfig;
