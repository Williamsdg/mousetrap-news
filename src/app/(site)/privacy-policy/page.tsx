import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Mouse Trap News',
  description: 'Mouse Trap News takes your privacy seriously. Read our full privacy policy and disclosures.',
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <article className="static-page">
      <header className="static-page-hero">
        <div className="container">
          <span className="hero-badge">Legal</span>
          <h1 className="static-page-title">Privacy Policy</h1>
          <p className="static-page-subtitle">
            What information we collect and how we use it.
          </p>
        </div>
      </header>

      <div className="container static-page-body">
        <section className="static-section">
          <h2>Disclosure</h2>
          <p>
            Information presented on MouseTrapNews.com is intended for entertainment
            purposes only. Mouse Trap News is an unofficial site and is not in any way
            affiliated with The Walt Disney Company. The views expressed on this website
            are satirical and made up stories and should not be construed as the official
            position of Mouse Trap News. Any information not confirmed by The Walt Disney
            Company or any of its subsidiaries should not be regarded as fact. Neither
            Mouse Trap News nor its members make any representations as to the validity,
            accuracy, completeness, or suitability of any claims made here. Neither
            Mouse Trap News nor its members assume any liability with regard to any
            actions you may or may not take based on the use of the information provided
            here. Furthermore, advertisers, commenters, and linked sites are solely
            responsible for their views and content, which do not necessarily represent
            the views of Mouse Trap News or its members.
          </p>
          <p>
            Per FTC guidelines, this website may be compensated by companies mentioned
            through advertising, affiliate programs, or otherwise. Any references to
            third-party products, rates, or websites are subject to change without
            notice. Please do the appropriate research before participating in any
            third-party offers.
          </p>
        </section>

        <section className="static-section">
          <h2>Privacy Policy</h2>
          <p>
            Mouse Trap News takes your privacy seriously. This privacy policy describes
            what personal information we collect and how we use it.
          </p>
        </section>

        <section className="static-section">
          <h2>Routine Information Collection</h2>
          <p>
            All web servers track basic information about their visitors. This
            information includes, but is not limited to, IP addresses, browser details,
            timestamps and referring pages. None of this information can personally
            identify specific visitors to this site. The information is tracked for
            routine administration and maintenance purposes.
          </p>
        </section>

        <section className="static-section">
          <h2>Information that we collect from third party sources</h2>
          <p>
            You can engage with us through social media platforms or mobile
            applications. When you engage with us through social media platforms, such
            as Facebook or Instagram, you allow us to have access to certain information
            from your social media profile based upon your privacy preference settings
            on such platform.
          </p>
        </section>

        <section className="static-section">
          <h2>Cookies and Web Beacons</h2>
          <p>
            Where necessary, MouseTrapNews.com uses cookies to store information about a
            visitor&apos;s preferences and history in order to better serve the visitor
            and/or present the visitor with customized content. Advertising partners and
            other third parties may also use cookies, scripts and/or web beacons to
            track visitors to our site in order to display advertisements and other
            useful information. Such tracking is done directly by the third parties
            through their own servers and is subject to their own privacy policies.
          </p>
        </section>

        <section className="static-section">
          <h2>Google Analytics</h2>
          <p>
            MouseTrapNews.com uses Google Analytics 4, a web-analytics service provided
            by Google LLC. Google Analytics uses cookies and similar tracking
            technologies to help us understand how visitors use our site. The data
            collected typically includes pages viewed, the referring site or search
            engine, approximate geographic location (derived from a truncated IP
            address), device and browser information, and the time spent on each page.
            We use this information solely to improve site content, layout, and
            performance.
          </p>
          <p>
            Google may also use this data subject to its own privacy policy, which is
            available at{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              policies.google.com/privacy
            </a>
            . If you would like to opt out of Google Analytics tracking across all
            websites, you can install Google&apos;s official browser add-on at{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </p>
        </section>

        <section className="static-section">
          <h2>Controlling Your Privacy</h2>
          <p>
            Note that you can change your browser settings to disable cookies if you
            have privacy concerns. Disabling cookies for all sites is not recommended as
            it may interfere with your use of some sites. The best option is to disable
            or enable cookies on a per-site basis. Consult your browser documentation
            for instructions on how to block cookies and other tracking mechanisms.
          </p>
        </section>

        <section className="static-section">
          <h2>Programmatic Advertising</h2>
          <p>
            This Site is affiliated with Monumetric (dba for The Blogger Network, LLC)
            for the purposes of placing advertising on the Site, and Monumetric will
            collect and use certain data for advertising purposes. To learn more about
            Monumetric&apos;s data usage, click here:{' '}
            <a href="http://www.monumetric.com/publisher-advertising-privacy" target="_blank" rel="noopener noreferrer">
              monumetric.com/publisher-advertising-privacy
            </a>
            .
          </p>
        </section>

        <section className="static-section">
          <h2>Unsubscribe or Opt-Out</h2>
          <p>
            All users and/or visitors to our website have the option to discontinue
            receiving communication from us and/or reserve the right to discontinue
            receiving communications by way of email or newsletters. To discontinue or
            unsubscribe to our website please send an email that you wish to the email
            on our website. If you wish to unsubscribe or opt-out from any third party
            websites, you must go to that specific website to unsubscribe and/or opt-out.
          </p>
        </section>

        <section className="static-section">
          <h2>Security</h2>
          <p>
            Mouse Trap News shall endeavor and shall take every precaution to maintain
            adequate physical, procedural and technical security with respect to its
            offices and information storage facilities so as to prevent any loss,
            misuse, unauthorized access, disclosure or modification of the user&apos;s
            personal information under our control.
          </p>
        </section>

        <section className="static-section">
          <h2>Acceptance of Terms</h2>
          <p>
            Through the use of this website, you are hereby accepting the terms and
            conditions stipulated within the aforementioned Privacy Policy agreement. If
            you are not in agreement with our terms and conditions, then you should
            refrain from further use of our sites. In addition, your continued use of
            our website following the posting of any updates or changes to our terms and
            conditions shall mean that you are in agreement and acceptance of such
            changes.
          </p>
          <p>
            The YouTube Terms of Service apply to certain portions of this website where
            YouTube content is displayed. The YouTube Terms of Service located at{' '}
            <a href="https://www.youtube.com/static?template=terms" target="_blank" rel="noopener noreferrer">
              youtube.com/static?template=terms
            </a>{' '}
            are incorporated herein by reference.
          </p>
        </section>

        <section className="static-section">
          <h2>How to Contact Us</h2>
          <p>
            If you have any questions or concerns regarding the Privacy Policy Agreement
            related to our website, please feel free to contact us at:
          </p>
          <p style={{ fontSize: '1.05rem' }}>
            <strong>
              <a href="mailto:themousetrapnews@gmail.com">themousetrapnews@gmail.com</a>
            </strong>
          </p>
        </section>
      </div>
    </article>
  )
}
