'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MobileNav from '@/components/admin/MobileNav'
import '../admin.css'

interface AdminComment {
  _id: string
  anonymous?: boolean
  firstName?: string
  lastName?: string
  body: string
  status: 'pending' | 'approved'
  submittedAt: string
  approvedAt?: string
  submitterIp?: string
  parent?: {
    _id: string
    body: string
    firstName?: string
    lastName?: string
    anonymous?: boolean
  }
  article?: {
    _id: string
    title: string
    slug: string
  }
}

function formatWhen(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function authorLabel(c: { anonymous?: boolean; firstName?: string; lastName?: string }) {
  if (c.anonymous) return 'Anonymous'
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Anonymous'
}

export default function AdminComments() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const router = useRouter()

  const fetchComments = useCallback(async (status: typeof filter) => {
    setLoading(true)
    const query = status === 'all' ? '' : `?status=${status}`
    const res = await fetch(`/api/admin/comments${query}`)
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setComments(data.comments || [])
    setPendingCount(data.pendingCount || 0)
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchComments(filter)
    fetch('/api/admin/auth').then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/admin/login')
      }
    }).catch(() => {})
  }, [fetchComments, filter, router])

  const approve = async (id: string) => {
    setBusyId(id)
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Approve failed: ${data.error || 'Unknown error'}`)
      return
    }
    fetchComments(filter)
  }

  const reject = async (id: string) => {
    if (!confirm('Delete this comment? This cannot be undone.')) return
    setBusyId(id)
    const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Delete failed: ${data.error || 'Unknown error'}`)
      return
    }
    fetchComments(filter)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Mouse Trap News</h2>
          <span>Admin Dashboard</span>
        </div>
        <nav className="admin-sidebar-nav">
          <Link href="/admin" className="admin-nav-link">
            <span className="nav-icon">📰</span> Articles
          </Link>
          <Link href="/admin/articles/new" className="admin-nav-link">
            <span className="nav-icon">✏️</span> New Article
          </Link>
          <div className="admin-nav-divider" />
          <Link href="/admin/categories" className="admin-nav-link">
            <span className="nav-icon">🏷️</span> Categories
          </Link>
          <Link href="/admin/comments" className="admin-nav-link active">
            <span className="nav-icon">💬</span> Comments
            {pendingCount > 0 && <span className="admin-nav-badge">{pendingCount}</span>}
          </Link>
          <div className="admin-nav-divider" />
          <a href="/" target="_blank" className="admin-nav-link">
            <span className="nav-icon">🌐</span> View Site
          </a>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">{user?.name?.split(' ').map(n => n[0]).join('') || '?'}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{user?.name || 'Loading...'}</div>
              <div className="admin-user-role">{user?.role === 'publisher' ? 'Publisher' : 'Writer'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout" style={{ marginTop: '0.5rem' }}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Comments</h1>
        </div>

        <div className="admin-content">
          <div className="admin-tabs">
            {(['pending', 'approved', 'all'] as const).map((tab) => (
              <button
                key={tab}
                className={`admin-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'pending' ? '👀 Pending' : tab === 'approved' ? '✅ Approved' : 'All'}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="tab-count">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">⏳</div>
              <h3>Loading comments...</h3>
            </div>
          ) : comments.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📭</div>
              <h3>No {filter === 'all' ? '' : filter} comments</h3>
              <p>{filter === 'pending' ? 'Inbox zero. Nothing to moderate.' : 'Nothing to show here.'}</p>
            </div>
          ) : (
            <ul className="admin-comments">
              {comments.map((c) => (
                <li key={c._id} className="admin-comment">
                  <div className="admin-comment__head">
                    <div>
                      <span className="admin-comment__author">{authorLabel(c)}</span>
                      {c.parent && (
                        <span className="admin-comment__reply-tag">↳ Reply</span>
                      )}
                      <span className="admin-comment__when">{formatWhen(c.submittedAt)}</span>
                    </div>
                    <span className={`status-badge status-${c.status === 'pending' ? 'in-review' : 'approved'}`}>
                      {c.status === 'pending' ? '👀 Pending' : '✅ Approved'}
                    </span>
                  </div>

                  {c.article && (
                    <div className="admin-comment__article">
                      On article:{' '}
                      <a href={`/${c.article.slug}`} target="_blank" rel="noopener noreferrer">
                        {c.article.title}
                      </a>
                    </div>
                  )}

                  {c.parent && (
                    <div className="admin-comment__parent">
                      In reply to <strong>{authorLabel(c.parent)}</strong>:
                      <em>&ldquo;{c.parent.body.slice(0, 160)}{c.parent.body.length > 160 ? '…' : ''}&rdquo;</em>
                    </div>
                  )}

                  <p className="admin-comment__body">{c.body}</p>

                  <div className="admin-comment__actions">
                    {c.status === 'pending' && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-success"
                        onClick={() => approve(c._id)}
                        disabled={busyId === c._id}
                      >
                        ✅ Approve
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => reject(c._id)}
                      disabled={busyId === c._id}
                    >
                      🗑 Delete
                    </button>
                    {c.submitterIp && (
                      <span className="admin-comment__ip">IP: {c.submitterIp}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
