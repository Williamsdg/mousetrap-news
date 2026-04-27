'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  url: string  // absolute URL of the article (e.g. https://mousetrap-news.vercel.app/<slug>)
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked — fall back to a select-the-text prompt
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <div className="share-buttons" aria-label="Share this article">
      <span className="share-buttons__label">Share:</span>

      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-btn--facebook"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/>
        </svg>
        <span>Facebook</span>
      </a>

      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-btn--x"
        aria-label="Share on X"
        title="Share on X"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2H21.5l-7.41 8.47L22.7 22h-6.78l-5.32-6.62L4.6 22H1.34l7.93-9.06L1.5 2h6.95l4.81 6.04L18.244 2Zm-1.19 18h1.84L7.04 4H5.07l11.99 16Z"/>
        </svg>
        <span>X</span>
      </a>

      <button
        type="button"
        onClick={copy}
        className={`share-btn share-btn--copy${copied ? ' share-btn--copied' : ''}`}
        aria-label="Copy article link"
        title="Copy article link"
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        <span>{copied ? 'Copied' : 'Copy link'}</span>
      </button>
    </div>
  )
}
