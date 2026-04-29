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
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStyle, setAiStyle] = useState('editorial')
  const [reviewNotes, setReviewNotes] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // AI image generation state. `aiPreview` holds the in-flight generated
  // image (base64 data URL or http URL) until Michael either uses it or
  // regenerates. We deliberately don't push to Sanity until he confirms.
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [aiError, setAiError] = useState('')
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

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Add a prompt first.')
      return
    }
    setAiGenerating(true)
    setAiError('')
    setAiPreview(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, style: aiStyle }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error || 'Generation failed.')
      } else {
        setAiPreview(data.image)
      }
    } catch {
      setAiError('Network error — please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleUseGeneratedImage = async () => {
    if (!aiPreview) return
    setAiGenerating(true)
    try {
      // Convert the data URL (or http URL) to a File the upload API accepts.
      const blobRes = await fetch(aiPreview)
      const blob = await blobRes.blob()
      const file = new File([blob], `ai-${Date.now()}.png`, { type: 'image/png' })

      const form = new FormData()
      form.append('file', file)
      form.append('articleId', articleId)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setAiError(`Upload failed: ${data.error || 'Unknown'}`)
      } else {
        setMainImageUrl(data.asset.url)
        setAiPreview(null)
      }
    } catch (err) {
      setAiError(`Upload error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setAiGenerating(false)
    }
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
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f0a2e' }}>🎨 AI Image Generation</h3>
                <p style={{ fontSize: '0.78rem', color: '#9a9490', marginBottom: '1rem' }}>
                  Describe an image and pick a style. We&apos;ll generate it with OpenAI and let you preview before saving as the featured image.
                </p>
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
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e8e3da', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', marginBottom: '1rem' }}
                >
                  <option value="editorial">Editorial Illustration</option>
                  <option value="photorealistic">Photorealistic</option>
                  <option value="cartoon">Cartoon / Animated</option>
                  <option value="vintage-poster">Vintage Poster</option>
                  <option value="park-photo">Disney Park Photography</option>
                </select>

                {/* GENERATE button + preview pane.
                    Generated image lives ONLY in local state until the
                    writer clicks "Use this image" — then it's uploaded to
                    Sanity and set as the article's mainImage. Regenerate
                    just discards the preview and runs again. */}
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="admin-btn admin-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {aiGenerating ? '⏳ Generating…' : '✨ Generate Image'}
                </button>

                {aiError && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: '#fff2f2', color: '#c0392b', borderRadius: '6px', fontSize: '0.82rem' }}>
                    {aiError}
                  </div>
                )}

                {aiPreview && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#faf8f5', borderRadius: '8px', border: '1px solid #e8e3da' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4a4540', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Preview
                    </div>
                    <img
                      src={aiPreview}
                      alt="AI-generated preview"
                      style={{ width: '100%', borderRadius: '6px', border: '1px solid #e8e3da', display: 'block', marginBottom: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleUseGeneratedImage}
                        disabled={aiGenerating}
                        className="admin-btn admin-btn-success"
                        style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }}
                      >
                        ✅ Use this image
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={aiGenerating}
                        className="admin-btn admin-btn-ghost"
                        style={{ justifyContent: 'center' }}
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiPreview(null)}
                        disabled={aiGenerating}
                        className="admin-btn admin-btn-ghost"
                        style={{ justifyContent: 'center' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
