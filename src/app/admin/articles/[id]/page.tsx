'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/admin/ImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { portableTextToHtml, htmlToPortableText } from '@/lib/portable-text-utils'
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
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStyle, setAiStyle] = useState('editorial')
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
        setAiPrompt(a.aiImagePrompt || '')
        setAiStyle(a.aiImageStyle || 'editorial')
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

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/admin/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        status,
        theme,
        featured,
        categoryId: categoryId || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        aiImagePrompt: aiPrompt,
        aiImageStyle: aiStyle,
        body: htmlToPortableText(bodyHtml),
        reviewNotes,
      }),
    })
    setSaving(false)
    alert('Article saved!')
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
            <button onClick={handleSave} className="admin-btn admin-btn-gold" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
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

              {/* AI Image */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f0a2e' }}>🎨 AI Image Generation</h3>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Image Prompt</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem' }}
                  placeholder="Describe the image you want AI to generate..."
                />
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.35rem' }}>Style</label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="editorial">Editorial Illustration</option>
                  <option value="photorealistic">Photorealistic</option>
                  <option value="cartoon">Cartoon / Animated</option>
                  <option value="vintage-poster">Vintage Poster</option>
                  <option value="park-photo">Disney Park Photography</option>
                </select>
              </div>
            </div>

            {/* RIGHT: Settings */}
            <div>
              {/* Status */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0f0a2e' }}>Status</h3>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="draft">📝 Draft</option>
                  <option value="in-review">👀 In Review</option>
                  <option value="approved">✅ Approved (Live)</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                {status === 'rejected' && (
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Feedback for the writer..."
                    rows={3}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginTop: '0.75rem' }}
                  />
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
                  <option value="auto">Auto (Rotate)</option>
                  <option value="enchanted-gazette">Enchanted Gazette</option>
                  <option value="storybook-chronicle">Storybook Chronicle</option>
                  <option value="neon-after-dark">Neon After Dark</option>
                  <option value="pixie-dust-sunrise">Pixie Dust Sunrise</option>
                  <option value="tomorrowland-times">Tomorrowland Times</option>
                </select>
              </div>

              {/* Tags */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f0a2e' }}>Tags</h3>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Disney World, Satire, Arrests..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#9a9490', marginTop: '0.25rem' }}>Comma-separated</div>
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
    </div>
  )
}
