'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/admin/ImageUpload'
import '../../admin.css'

interface Category {
  _id: string
  title: string
  icon?: string
}

export default function NewArticle() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [theme, setTheme] = useState('auto')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/categories').then(async (res) => {
      if (res.status === 401) { router.push('/admin/login'); return }
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    })
  }, [router])

  const handleCreate = async () => {
    if (!title.trim()) { alert('Title is required'); return }
    setSaving(true)
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt,
        theme,
        categoryId: categoryId || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        publishedAt: new Date().toISOString(),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.article?._id) {
      router.push(`/admin/articles/${data.article._id}`)
    }
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
          <Link href="/admin/articles/new" className="admin-nav-link active">
            <span className="nav-icon">✏️</span> New Article
          </Link>
          <div className="admin-nav-divider" />
          <Link href="/admin/categories" className="admin-nav-link">
            <span className="nav-icon">🏷️</span> Categories
          </Link>
        </nav>
      </aside>

      <div className="admin-main">
        <div className="admin-header">
          <h1>New Article</h1>
          <button onClick={handleCreate} className="admin-btn admin-btn-gold" disabled={saving}>
            {saving ? 'Creating...' : '✨ Create Article'}
          </button>
        </div>

        <div className="admin-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Title *</label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }}
                  placeholder="Your amazing satirical headline..."
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.78rem', color: '#9a9490', marginTop: '0.25rem' }}>Slug: /{slug || '...'}</div>
              </div>

              <ImageUpload onUploaded={() => {}} />

              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={4}
                  placeholder="A short, witty summary of the article..."
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>

            <div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Category</h3>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Visual Theme</h3>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="auto">Auto (Rotate)</option>
                  <option value="enchanted-gazette">Enchanted Gazette</option>
                  <option value="storybook-chronicle">Storybook Chronicle</option>
                  <option value="neon-after-dark">Neon After Dark</option>
                  <option value="pixie-dust-sunrise">Pixie Dust Sunrise</option>
                  <option value="tomorrowland-times">Tomorrowland Times</option>
                </select>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Tags</h3>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Disney World, Satire..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#9a9490', marginTop: '0.25rem' }}>Comma-separated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
