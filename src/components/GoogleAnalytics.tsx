import Script from 'next/script'

// Renders the GA4 gtag loader + init script when NEXT_PUBLIC_GA_MEASUREMENT_ID
// is set. When the env var is unset (e.g. local dev, preview deploys without
// the secret), this returns null so no scripts hit the page and there's no
// console noise. Mount only inside the public-site layout — we deliberately
// don't track the admin dashboard or Sanity Studio.
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!id) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  )
}
