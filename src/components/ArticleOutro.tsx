// Auto-appended to every article so writers don't have to paste this block
// at the bottom of each post. Deliberately matches the copy Michael was
// pasting manually so behavior on existing articles is unchanged from the
// reader's perspective.

const BOOK_URL = 'https://www.amazon.com/dp/B0DM2GWSD5'
const SHIRT_URL = 'https://www.etsy.com/shop/mousetrapnews/?etsrc=sdt'
const TIKTOK_URL = 'https://www.tiktok.com/@mousetrapnews'
const INSTAGRAM_URL = 'https://www.instagram.com/mousetrapnews/'
const FACEBOOK_URL = 'https://www.facebook.com/mousetrapnews/'
const TWITTER_URL = 'https://x.com/mousetrapnews'

export default function ArticleOutro() {
  return (
    <aside className="article-outro" aria-label="More from Mouse Trap News">
      <h3 className="article-outro__title">
        Make Sure to Follow Us and Check Out Our{' '}
        <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">Book</a>!
      </h3>
      <p className="article-outro__body">
        To stay up to date on more very real Disney news like this totally made-up
        story, be sure to follow <strong>Mouse Trap News</strong> on{' '}
        <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer">TikTok</a>,{' '}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>,{' '}
        <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Facebook</a>, and{' '}
        <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer">Twitter</a>. We
        published a book on Amazon that you can purchase{' '}
        <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">here</a>! It would
        be an honor to see you walking around Disney World in a Mouse Trap News shirt{' '}
        <a href={SHIRT_URL} target="_blank" rel="noopener noreferrer">here</a>! Disney
        will love it too.
      </p>
    </aside>
  )
}
