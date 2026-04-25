import type { Metadata } from 'next'
import { Playfair_Display, Inter, Crimson_Text } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const crimson = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mousetrap-news.vercel.app'),
  title: {
    default: 'Mouse Trap News — The Moused Trusted Name in Disney News',
    template: '%s | Mouse Trap News',
  },
  description: 'The world\'s best satire and parody site for Disney Parks news. Totally made up. Completely hilarious.',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon-32.png',
  },
  openGraph: {
    siteName: 'Mouse Trap News',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Mouse Trap News — The Moused Trusted Name in Disney News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mouse Trap News — The Moused Trusted Name in Disney News',
    description: 'The world\'s best satire and parody site for Disney Parks news.',
    images: ['/og-default.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${crimson.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
