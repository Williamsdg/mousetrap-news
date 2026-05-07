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
};

export default nextConfig;
