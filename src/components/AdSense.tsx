import Script from 'next/script'

// Renders the AdSense loader script when NEXT_PUBLIC_ADSENSE_CLIENT is set
// (format: ca-pub-XXXXXXXXXXXXXXXX). When unset, returns null so no script
// hits the page — lets the integration ship before Michael hands over his
// Publisher ID. Mount only inside the public-site layout so /admin and
// /studio stay free of ad scripts.

export default function AdSense() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!client) return null

  return (
    <Script
      id="adsense-loader"
      async
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  )
}
