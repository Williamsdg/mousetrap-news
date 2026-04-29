'use client'

import { useEffect, useState, useCallback } from 'react'

interface AssetRow {
  _id: string
  url: string
  originalFilename?: string
  _createdAt: string
  width?: number
  height?: number
  altUsedOnArticle?: string
}

interface ImageLibraryModalProps {
  open: boolean
  onClose: () => void
  /**
   * Called when the writer picks an image. Receives the Sanity asset _id
   * (e.g. "image-abc123-1920x1080-jpg") and its CDN URL. Caller decides
   * whether to set it as a main image, insert inline, etc.
   */
  onSelect: (assetId: string, url: string, alt?: string) => void
}

export default function ImageLibraryModal({ open, onClose, onSelect }: ImageLibraryModalProps) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // Debounce search input so we don't fire a Sanity query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // Reset to page 1 whenever the search term changes.
  useEffect(() => { setPage(1) }, [debouncedQ])

  const load = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQ) params.set('q', debouncedQ)
      params.set('page', String(page))
      const res = await fetch(`/api/admin/images?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data.assets || [])
        setTotalPages(data.totalPages || 1)
      }
    } finally {
      setLoading(false)
    }
  }, [open, debouncedQ, page])

  useEffect(() => { load() }, [load])

  // Esc closes the modal.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="image-library-overlay" onClick={onClose} role="dialog" aria-label="Image library">
      <div className="image-library" onClick={(e) => e.stopPropagation()}>
        <header className="image-library__head">
          <h2>Choose from library</h2>
          <button type="button" className="image-library__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="image-library__search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by filename or alt text…"
            autoFocus
          />
        </div>

        <div className="image-library__body">
          {loading ? (
            <div className="image-library__empty">⏳ Loading…</div>
          ) : assets.length === 0 ? (
            <div className="image-library__empty">
              {debouncedQ ? `No images match “${debouncedQ}”.` : 'No images uploaded yet.'}
            </div>
          ) : (
            <div className="image-library__grid">
              {assets.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  className="image-library__tile"
                  onClick={() => onSelect(a._id, a.url, a.altUsedOnArticle)}
                  title={a.originalFilename || a._id}
                >
                  <img src={`${a.url}?w=300&h=200&fit=crop&q=70`} alt={a.altUsedOnArticle || a.originalFilename || ''} loading="lazy" />
                  <div className="image-library__tile-meta">
                    <span className="image-library__tile-name">{a.originalFilename || 'Untitled'}</span>
                    {a.width && a.height && (
                      <span className="image-library__tile-dims">{a.width}×{a.height}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <footer className="image-library__pagination">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
