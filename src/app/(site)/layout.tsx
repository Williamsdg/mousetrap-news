import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopBar from '@/components/layout/TopBar'
import MagicParticles from '@/components/layout/MagicParticles'
import MobileStickyAd from '@/components/MobileStickyAd'

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
    </>
  )
}
