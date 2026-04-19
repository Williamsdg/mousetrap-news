'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../admin.css'

interface Category {
  _id: string
  title: string
  slug: { current: string }
  icon?: string
  color?: string
  description?: string
  articleCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/categories').then(async (res) => {
      if (res.status === 401) { router.push('/admin/login'); return }
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
      setLoading(false)
    })
  }, [router])

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
          <Link href="/admin/categories" className="admin-nav-link active">
            <span className="nav-icon">🏷️</span> Categories
          </Link>
          <div className="admin-nav-divider" />
          <a href="/" target="_blank" className="admin-nav-link">
            <span className="nav-icon">🌐</span> View Site
          </a>
        </nav>
      </aside>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Categories</h1>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">⏳</div>
              <h3>Loading categories...</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {categories.map((cat) => (
                <div key={cat._id} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${cat.color || '#9a9490'}`,
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f0a2e', marginBottom: '0.25rem' }}>
                    {cat.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#9a9490', marginBottom: '0.5rem' }}>
                    /{cat.slug.current}
                  </div>
                  {cat.description && (
                    <p style={{ fontSize: '0.85rem', color: '#4a4540', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {cat.description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: cat.color || '#9a9490' }}>
                    {cat.articleCount} articles
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
