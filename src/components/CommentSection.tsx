'use client'

import { useState } from 'react'

interface CommentReply {
  _id: string
  anonymous?: boolean
  firstName?: string
  lastName?: string
  body: string
  submittedAt: string
}

interface Comment extends CommentReply {
  replies?: CommentReply[]
}

interface CommentSectionProps {
  articleId: string
  initialComments: Comment[]
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function authorLabel(c: Pick<CommentReply, 'anonymous' | 'firstName' | 'lastName'>) {
  if (c.anonymous) return 'Anonymous'
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Anonymous'
}

interface FormProps {
  articleId: string
  parentId?: string
  onSuccess: () => void
  onCancel?: () => void
  compact?: boolean
}

function CommentForm({ articleId, parentId, onSuccess, onCancel, compact }: FormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          parentId,
          firstName: anonymous ? undefined : firstName,
          lastName: anonymous ? undefined : lastName,
          anonymous,
          body,
          website,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }
      onSuccess()
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className={`comment-form${compact ? ' comment-form--compact' : ''}`}>
      {/* Honeypot — hidden from humans, irresistible to dumb bots. */}
      <div aria-hidden="true" className="comment-form__honeypot">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {!anonymous && (
        <div className="comment-form__row">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required={!anonymous}
            disabled={status === 'submitting'}
            aria-label="First name"
            maxLength={60}
            autoComplete="given-name"
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required={!anonymous}
            disabled={status === 'submitting'}
            aria-label="Last name"
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      )}

      <textarea
        placeholder={parentId ? 'Write your reply…' : 'Share your thoughts…'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        disabled={status === 'submitting'}
        rows={compact ? 3 : 4}
        maxLength={2000}
        aria-label="Comment"
      />

      <div className="comment-form__footer">
        <label className="comment-form__anon">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={status === 'submitting'}
          />
          Post anonymously
        </label>
        <div className="comment-form__actions">
          {onCancel && (
            <button
              type="button"
              className="comment-form__cancel"
              onClick={onCancel}
              disabled={status === 'submitting'}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-glow btn-sm"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting…' : parentId ? 'Post Reply' : 'Post Comment'}
          </button>
        </div>
      </div>

      {status === 'error' && (
        <p className="comment-form__error">{errorMsg}</p>
      )}
    </form>
  )
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [submittedTopLevel, setSubmittedTopLevel] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submittedReplyForId, setSubmittedReplyForId] = useState<string | null>(null)

  const totalCount =
    initialComments.length +
    initialComments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="comments-heading">
        {totalCount > 0
          ? `${totalCount} Comment${totalCount === 1 ? '' : 's'}`
          : 'Comments'}
      </h2>

      {/* TOP-LEVEL FORM */}
      {submittedTopLevel ? (
        <div className="comments-success">
          <strong>Thanks!</strong> Your comment is awaiting approval and will appear here once reviewed.
        </div>
      ) : (
        <CommentForm
          articleId={articleId}
          onSuccess={() => setSubmittedTopLevel(true)}
        />
      )}

      {/* THREAD */}
      {initialComments.length === 0 ? (
        <p className="comments-empty">No comments yet. Be the first to weigh in.</p>
      ) : (
        <ol className="comments-list">
          {initialComments.map((c) => (
            <li key={c._id} className="comment">
              <div className="comment__head">
                <span className="comment__author">{authorLabel(c)}</span>
                <span className="comment__date">{formatDate(c.submittedAt)}</span>
              </div>
              <p className="comment__body">{c.body}</p>

              {c.replies && c.replies.length > 0 && (
                <ol className="comment__replies">
                  {c.replies.map((r) => (
                    <li key={r._id} className="comment comment--reply">
                      <div className="comment__head">
                        <span className="comment__author">{authorLabel(r)}</span>
                        <span className="comment__date">{formatDate(r.submittedAt)}</span>
                      </div>
                      <p className="comment__body">{r.body}</p>
                    </li>
                  ))}
                </ol>
              )}

              {/* REPLY BLOCK */}
              {submittedReplyForId === c._id ? (
                <div className="comments-success comments-success--inline">
                  <strong>Thanks!</strong> Your reply is awaiting approval.
                </div>
              ) : replyingTo === c._id ? (
                <CommentForm
                  articleId={articleId}
                  parentId={c._id}
                  compact
                  onSuccess={() => {
                    setSubmittedReplyForId(c._id)
                    setReplyingTo(null)
                  }}
                  onCancel={() => setReplyingTo(null)}
                />
              ) : (
                <button
                  type="button"
                  className="comment__reply-btn"
                  onClick={() => setReplyingTo(c._id)}
                >
                  Reply
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
