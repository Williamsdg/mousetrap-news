import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopBar from '@/components/layout/TopBar'
import MagicParticles from '@/components/layout/MagicParticles'
import MobileStickyAd from '@/components/MobileStickyAd'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import AdSense from '@/components/AdSense'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MagicParticles />
      <TopBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileStickyAd />
      <AdSense />
      <GoogleAnalytics />
    </>
  )
}
