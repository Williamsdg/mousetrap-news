'use client'

import { useState, useRef } from 'react'
import ImageLibraryModal from './ImageLibraryModal'

interface ImageUploadProps {
  articleId?: string
  currentImage?: string
  onUploaded?: (assetId: string, url: string) => void
}

export default function ImageUpload({ articleId, currentImage, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || '')
  const [dragActive, setDragActive] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)
    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('file', file)
    if (articleId) formData.append('articleId', articleId)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        alert(`Upload failed: ${data.error}`)
        setPreview(currentImage || '')
        return
      }

      setPreview(data.asset.url)
      onUploaded?.(data.asset._id, data.asset.url)
    } catch {
      alert('Upload failed')
      setPreview(currentImage || '')
    } finally {
      setUploading(false)
    }
  }

  // Pick an existing asset from the library. We patch the article's
  // mainImage to point at the chosen asset reference (server-side route),
  // then update local preview state with the URL.
  const handlePickFromLibrary = async (assetId: string, url: string) => {
    setLibraryOpen(false)
    if (!articleId) {
      // No articleId means the caller is using ImageUpload for something
      // other than a saved article. Just bubble up the selection.
      setPreview(url)
      onUploaded?.(assetId, url)
      return
    }
    setUploading(true)
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(`Failed to attach image: ${data.error || 'Unknown error'}`)
        return
      }
      setPreview(url)
      onUploaded?.(assetId, url)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0f0a2e' }}>
        📷 Featured Image
      </h3>

      {preview ? (
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <img
            src={preview}
            alt="Featured"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #e8e3da',
            }}
          />
          {uploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              Uploading...
            </div>
          )}
        </div>
      ) : null}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#2d1b69' : '#e8e3da'}`,
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
          background: dragActive ? 'rgba(45,27,105,0.03)' : '#faf8f5',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {uploading ? '⏳' : '📁'}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a4540', marginBottom: '0.25rem' }}>
          {uploading ? 'Uploading...' : preview ? 'Replace image' : 'Drop an image here or click to upload'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9a9490' }}>
          JPG, PNG, WebP — max 10MB
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setLibraryOpen(true) }}
        disabled={uploading}
        className="admin-btn admin-btn-ghost"
        style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
      >
        🗂️ Choose from library
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <ImageLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handlePickFromLibrary}
      />
    </div>
  )
}
