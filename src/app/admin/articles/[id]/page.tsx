'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/admin/ImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'
import TagsInput from '@/components/admin/TagsInput'
import { portableTextToHtml, htmlToPortableText } from '@/lib/portable-text-utils'
import MobileNav from '@/components/admin/MobileNav'
import '../../admin.css'

interface Category {
  _id: string
  title: string
  icon?: string
}

export default function ArticleEditor({ params }: { params: Promise<{ id: string }> }) {
  const [articleId, setArticleId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState('draft')
  const [theme, setTheme] = useState('auto')
  const [featured, setFeatured] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [tags, setTags] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      setArticleId(id)
      // Fetch article
      fetch(`/api/admin/articles/${id}`).then(async (res) => {
        if (res.status === 401) { router.push('/admin/login'); return }
        if (res.status === 404) { router.push('/admin'); return }
        const data = await res.json()
        const a = data.article
        setTitle(a.title || '')
        setSlug(a.slug?.current || '')
        setExcerpt(a.excerpt || '')
        setStatus(a.status || 'draft')
        setTheme(a.theme || 'auto')
        setFeatured(a.featured || false)
        setCategoryId(a.category?._id || '')
        setTags(a.tags?.join(', ') || '')
        setMainImageUrl(a.mainImageUrl || '')
        setBodyHtml(a.body ? portableTextToHtml(a.body) : '')
        setReviewNotes(a.reviewNotes || '')
        setLoading(false)
      })
      // Fetch categories
      fetch('/api/admin/categories').then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      })
    })
  }, [params, router])

  // Shared save body — used by both "Save Draft" and "Publish" so they can't
  // drift apart.
  const buildPayload = (overrideStatus?: string) => ({
    title,
    slug,
    excerpt,
    status: overrideStatus ?? status,
    theme,
    featured,
    categoryId: categoryId || undefined,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    body: htmlToPortableText(bodyHtml),
    reviewNotes,
  })

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/admin/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    })
    setSaving(false)
    alert('Draft saved!')
  }

  // One-click publish: bumps status to 'approved' (live) and saves everything
  // else in the same request. Removes the two-step "set status then save"
  // dance that didn't make sense for a single-author workflow.
  const handlePublish = async () => {
    setSaving(true)
    await fetch(`/api/admin/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload('approved')),
    })
    setStatus('approved')
    setSaving(false)
    alert('Published! Article is now live.')
  }

  const handleUnpublish = async () => {
    if (!confirm('Take this article off the live site? It will become a draft.')) return
    setSaving(true)
    await fetch(`/api/admin/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload('draft')),
    })
    setStatus('draft')
    setSaving(false)
    alert('Article unpublished. It is now a draft.')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return
    await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' })
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-main">
          <div className="admin-content">
            <div className="admin-empty">
              <div className="admin-empty-icon">⏳</div>
              <h3>Loading article...</h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
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
          <Link href="/admin/comments" className="admin-nav-link">
            <span className="nav-icon">💬</span> Comments
          </Link>
          <div className="admin-nav-divider" />
          <a href="/" target="_blank" className="admin-nav-link">
            <span className="nav-icon">🌐</span> View Site
          </a>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Edit Article</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} className="admin-btn" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Draft'}
            </button>
            {status === 'approved' ? (
              <button onClick={handleUnpublish} className="admin-btn" disabled={saving}>
                {saving ? 'Saving...' : '👁️‍🗨️ Unpublish'}
              </button>
            ) : (
              <button onClick={handlePublish} className="admin-btn admin-btn-gold" disabled={saving}>
                {saving ? 'Publishing...' : '🚀 Publish'}
              </button>
            )}
            <button onClick={handleDelete} className="admin-btn admin-btn-danger">
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="admin-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            {/* LEFT: Content */}
            <div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Title</label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.78rem', color: '#9a9490', marginTop: '0.25rem' }}>
                  Slug: /{slug}
                </div>
              </div>

              <ImageUpload
                articleId={articleId}
                currentImage={mainImageUrl}
                onUploaded={(_assetId, url) => setMainImageUrl(url)}
              />

              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Short summary for card previews..."
                />
              </div>

              {/* Article Body */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.5rem' }}>Article Body</label>
                <RichTextEditor content={bodyHtml} onChange={setBodyHtml} />
              </div>

            </div>

            {/* RIGHT: Settings */}
            <div>
              {/* Status — read-only indicator. The Publish / Unpublish buttons
                  in the header drive state changes now. */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Status</h3>
                {status === 'approved' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: '#e6f7ec', border: '1px solid #b6e6c8', borderRadius: '8px', fontSize: '0.9rem', color: '#1f6a3d', fontWeight: 600 }}>
                    ✅ Live on site
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: '#fdf6e3', border: '1px solid #e8d8a8', borderRadius: '8px', fontSize: '0.9rem', color: '#6a5421', fontWeight: 600 }}>
                    📝 Draft — not live
                  </div>
                )}
              </div>

              {/* Category */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Category</h3>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Visual Theme</h3>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="auto">Auto (by Category)</option>
                  <option value="magic-kingdom">Magic Kingdom</option>
                  <option value="epcot">EPCOT</option>
                  <option value="hollywood-studios">Hollywood Studios</option>
                  <option value="animal-kingdom">Animal Kingdom</option>
                  <option value="resorts">Resorts</option>
                  <option value="cross-property">Cross Property</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Tags</h3>
                <TagsInput value={tags} onChange={setTags} />
              </div>

              {/* Featured */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2d1b69' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f0a2e' }}>⭐ Featured Story</span>
                </label>
                <div style={{ fontSize: '0.78rem', color: '#9a9490', marginTop: '0.25rem', marginLeft: '26px' }}>Show in hero section on homepage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
