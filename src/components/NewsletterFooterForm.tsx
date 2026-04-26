'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function NewsletterFooterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }
      setStatus('success')
      setEmail('')
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="footer-newsletter-success">
        Thanks! We&apos;ll be in touch if and when we bring the newsletter back.
      </p>
    )
  }

  return (
    <form className="footer-newsletter" onSubmit={handleSubmit}>
      <p className="footer-newsletter__lede">
        We&apos;re not currently sending emails, but drop your address below
        and we&apos;ll let you know if we ever bring the newsletter back.
      </p>
      <div className="footer-newsletter__row">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          autoComplete="email"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          className="btn btn-glow btn-sm"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Saving…' : 'Sign up'}
        </button>
      </div>
      {status === 'error' && (
        <p className="footer-newsletter__error">{errorMsg}</p>
      )}
    </form>
  )
}
