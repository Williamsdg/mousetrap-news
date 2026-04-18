import type { Metadata } from 'next'
import { Playfair_Display, Inter, Crimson_Text } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopBar from '@/components/layout/TopBar'
import MagicParticles from '@/components/layout/MagicParticles'

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
  title: {
    default: 'Mouse Trap News — The Moused Trusted Name in Disney News',
    template: '%s | Mouse Trap News',
  },
  description: 'The world\'s best satire and parody site for Disney Parks news. Totally made up. Completely hilarious.',
  openGraph: {
    siteName: 'Mouse Trap News',
    type: 'website',
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
      <body>
        <MagicParticles />
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
