'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './admin.css'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  status: string
  excerpt?: string
  publishedAt: string
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  reviewNotes?: string
  featured: boolean
  category?: { _id: string; title: string; icon?: string; color?: string }
  author?: { _id: string; name: string }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(s: string) {
  return `status-badge status-${s}`
}

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    draft: '📝 Draft',
    'in-review': '👀 In Review',
    approved: '✅ Published',
    rejected: '❌ Rejected',
  }
  return labels[s] || s
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const router = useRouter()

  const fetchArticles = useCallback(async (status?: string) => {
    setLoading(true)
    const query = status && status !== 'all' ? `?status=${status}` : ''
    const res = await fetch(`/api/admin/articles${query}`)
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setArticles(data.articles || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchArticles()
    fetch('/api/admin/auth').then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/admin/login')
      }
    }).catch(() => {})
  }, [fetchArticles, router])

  const handleFilter = (status: string) => {
    setFilter(status)
    fetchArticles(status)
  }

  const handleStatusChange = async (id: string, newStatus: string, reviewNotes?: string) => {
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reviewNotes }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(`Error: ${data.error || 'Failed to update status'}`)
      return
    }
    const statusMessages: Record<string, string> = {
      'in-review': 'Article submitted for review!',
      'approved': 'Article approved and published!',
      'rejected': 'Article rejected with notes.',
      'draft': 'Article moved back to drafts.',
    }
    alert(statusMessages[newStatus] || 'Status updated!')
    // Refresh on "all" tab so user sees the article in its new status
    setFilter('all')
    fetchArticles('all')
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const counts = {
    all: articles.length,
    draft: articles.filter(a => a.status === 'draft').length,
    'in-review': articles.filter(a => a.status === 'in-review').length,
    approved: articles.filter(a => a.status === 'approved').length,
    rejected: articles.filter(a => a.status === 'rejected').length,
  }

  // When filter is "all", show all; otherwise already filtered by API
  const displayArticles = filter === 'all' ? articles : articles

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Mouse Trap News</h2>
          <span>Admin Dashboard</span>
        </div>
        <nav className="admin-sidebar-nav">
          <Link href="/admin" className="admin-nav-link active">
            <span className="nav-icon">📰</span> Articles
          </Link>
          <Link href="/admin/articles/new" className="admin-nav-link">
            <span className="nav-icon">✏️</span> New Article
          </Link>
          <div className="admin-nav-divider" />
          <Link href="/admin/categories" className="admin-nav-link">
            <span className="nav-icon">🏷️</span> Categories
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

      {/* MAIN */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Articles</h1>
          <Link href="/admin/articles/new" className="admin-btn admin-btn-gold">
            ✏️ New Article
          </Link>
        </div>

        <div className="admin-content">
          {/* STATS */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Articles</div>
              <div className="admin-stat-value">{counts.all}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Pending Review</div>
              <div className="admin-stat-value" style={{ color: '#856404' }}>{counts['in-review']}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Published</div>
              <div className="admin-stat-value" style={{ color: '#28a745' }}>{counts.approved}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Drafts</div>
              <div className="admin-stat-value" style={{ color: '#9a9490' }}>{counts.draft}</div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="admin-tabs">
            {(['all', 'draft', 'in-review', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                className={`admin-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => handleFilter(tab)}
              >
                {tab === 'all' ? 'All' : statusLabel(tab)}
              </button>
            ))}
          </div>

          {/* ARTICLES TABLE */}
          {loading ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">⏳</div>
              <h3>Loading articles...</h3>
            </div>
          ) : displayArticles.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📭</div>
              <h3>No articles found</h3>
              <p>{filter === 'all' ? 'Create your first article to get started.' : `No articles with status "${filter}".`}</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayArticles.map((article) => (
                  <tr key={article._id}>
                    <td className="article-title-cell">
                      <Link href={`/admin/articles/${article._id}`}>
                        {article.title}
                      </Link>
                      {article.featured && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#f0c040' }}>⭐ Featured</span>}
                    </td>
                    <td>
                      {article.category && (
                        <span className="cat-badge">
                          {article.category.icon} {article.category.title}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={statusClass(article.status)}>
                        {statusLabel(article.status)}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(article.publishedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {article.status === 'in-review' && user?.role === 'publisher' && (
                          <>
                            <button
                              className="admin-btn admin-btn-success"
                              onClick={() => handleStatusChange(article._id, 'approved')}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="admin-btn admin-btn-danger"
                              onClick={() => {
                                const notes = prompt('Rejection notes for the writer:')
                                if (notes !== null) handleStatusChange(article._id, 'rejected', notes)
                              }}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {article.status === 'in-review' && user?.role === 'writer' && (
                          <span style={{ fontSize: '0.8rem', color: '#856404', fontStyle: 'italic' }}>Awaiting approval</span>
                        )}
                        {article.status === 'draft' && (
                          <button
                            className="admin-btn admin-btn-ghost"
                            onClick={() => handleStatusChange(article._id, 'in-review')}
                          >
                            Submit for Review
                          </button>
                        )}
                        {article.status === 'rejected' && (
                          <button
                            className="admin-btn admin-btn-ghost"
                            onClick={() => handleStatusChange(article._id, 'draft')}
                          >
                            Move to Draft
                          </button>
                        )}
                        <Link href={`/admin/articles/${article._id}`} className="admin-btn admin-btn-ghost">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
