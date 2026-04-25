'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { Mark, mergeAttributes } from '@tiptap/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

interface Toast {
  id: number
  text: string
  kind: 'info' | 'error' | 'success'
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '0.35rem 0.5rem',
        borderRadius: '4px',
        border: 'none',
        background: active ? '#2d1b69' : 'transparent',
        color: active ? '#fff' : '#4a4540',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.1s',
        minWidth: '28px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) e.currentTarget.style.background = '#f0ede8'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span style={{ width: '1px', height: '20px', background: '#e8e3da', margin: '0 0.25rem' }} />
}

// Image extension that supports our extra attributes for round-tripping to Sanity
const SanityImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-sanity-asset': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-sanity-asset'),
        renderHTML: (attrs) => {
          if (!attrs['data-sanity-asset']) return {}
          return { 'data-sanity-asset': attrs['data-sanity-asset'] }
        },
      },
      'data-caption': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-caption'),
        renderHTML: (attrs) => (attrs['data-caption'] ? { 'data-caption': attrs['data-caption'] } : {}),
      },
      'data-alignment': {
        default: 'full',
        parseHTML: (el) => el.getAttribute('data-alignment') || 'full',
        renderHTML: (attrs) => ({ 'data-alignment': attrs['data-alignment'] || 'full' }),
      },
      'data-size': {
        default: 'large',
        parseHTML: (el) => el.getAttribute('data-size') || 'large',
        renderHTML: (attrs) => ({ 'data-size': attrs['data-size'] || 'large' }),
      },
    }
  },
})

// Footnote mark — wraps inline text with a sup-style indicator and stores text in data-footnote
const Footnote = Mark.create({
  name: 'footnote',
  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-footnote') || '',
        renderHTML: (attrs) => ({ 'data-footnote': attrs.text }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-footnote]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'footnote-mark' }), 0]
  },
})

function countWords(html: string): number {
  if (!html) return 0
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [imagePopover, setImagePopover] = useState<{ visible: boolean; alt: string; caption: string; alignment: string; size: string }>({
    visible: false, alt: '', caption: '', alignment: 'full', size: 'large',
  })

  const pushToast = useCallback((text: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, text, kind }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your article... (you can drag-and-drop or paste images directly)',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      SanityImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Footnote,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 300px; padding: 1.5rem; font-family: Georgia, serif; font-size: 1.05rem; line-height: 1.8; color: #1a1715;',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              uploadAndInsertRef.current?.(file)
              return true
            }
          }
        }
        return false
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const imgFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
        if (imgFiles.length === 0) return false
        event.preventDefault()
        imgFiles.forEach((f) => uploadAndInsertRef.current?.(f))
        return true
      },
    },
  })

  // Update content if prop changes externally
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Sync the image popover to whatever image is currently selected
  useEffect(() => {
    if (!editor) return
    const sync = () => {
      if (editor.isActive('image')) {
        const attrs = editor.getAttributes('image')
        setImagePopover({
          visible: true,
          alt: attrs.alt || '',
          caption: attrs['data-caption'] || '',
          alignment: attrs['data-alignment'] || 'full',
          size: attrs['data-size'] || 'large',
        })
      } else {
        setImagePopover((p) => (p.visible ? { ...p, visible: false } : p))
      }
    }
    editor.on('selectionUpdate', sync)
    editor.on('transaction', sync)
    return () => {
      editor.off('selectionUpdate', sync)
      editor.off('transaction', sync)
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    if (!file.type.startsWith('image/')) {
      pushToast('Please choose an image file', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(`Uploading ${file.name}…`)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        pushToast(`Upload failed: ${data.error || 'Unknown error'}`, 'error')
        return
      }

      const { _id: assetId, url } = data.asset

      setUploadProgress('Generating alt text…')
      let alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      try {
        const altRes = await fetch('/api/admin/alt-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        })
        if (altRes.ok) {
          const altData = await altRes.json()
          if (altData.alt) alt = altData.alt
        }
      } catch {
        // fall back to filename-based alt
      }

      editor
        .chain()
        .focus()
        .setImage({ src: url, alt })
        .updateAttributes('image', {
          'data-sanity-asset': assetId,
          'data-alignment': 'full',
          'data-size': 'large',
        })
        .run()

      pushToast('Image inserted', 'success')
    } catch (err) {
      pushToast(`Upload error: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }, [editor, pushToast])

  // Refs so the editor's paste/drop handlers (created once) call the latest version
  const uploadAndInsertRef = useRef<(file: File) => void>(undefined as unknown as (file: File) => void)
  useEffect(() => { uploadAndInsertRef.current = handleImageUpload }, [handleImageUpload])

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleImageUpload(file)
      e.target.value = ''
    },
    [handleImageUpload]
  )

  const insertYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('YouTube URL')
    if (!url) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const insertFootnote = useCallback(() => {
    if (!editor) return
    const text = window.prompt('Footnote text')
    if (!text) return
    editor.chain().focus().setMark('footnote', { text }).run()
  }, [editor])

  const updateImageAttr = useCallback((key: string, value: string) => {
    if (!editor) return
    if (key === 'alt') {
      editor.chain().focus().updateAttributes('image', { alt: value }).run()
    } else {
      editor.chain().focus().updateAttributes('image', { [key]: value }).run()
    }
  }, [editor])

  const wordCount = useMemo(() => countWords(content), [content])
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  if (!editor) return null

  return (
    <div className="rte-shell" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem', position: 'relative' }}>
      {/* TOOLBAR */}
      <div className="rte-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.15rem',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #e8e3da',
        background: '#faf8f5',
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><u>U</u></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><span style={{ background: '#ffd86e', padding: '0 3px', borderRadius: '2px' }}>H</span></ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">&#8226;<span className="rte-label"> List</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">1.<span className="rte-label"> List</span></ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Block Quote">&#10077;<span className="rte-label"> Quote</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">&#8212;</ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={uploading} title={uploading ? 'Uploading…' : 'Insert image (or drag/paste)'}>
          {uploading ? '⏳' : '🖼️'}<span className="rte-label"> Image</span>
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} style={{ display: 'none' }} />

        <ToolbarButton onClick={insertYoutube} title="Insert YouTube video">▶<span className="rte-label"> YT</span></ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert table">📊<span className="rte-label"> Table</span></ToolbarButton>

        <Divider />

        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert Link">&#128279;<span className="rte-label"> Link</span></ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">&#10060;</ToolbarButton>
        )}
        <ToolbarButton onClick={insertFootnote} active={editor.isActive('footnote')} title="Add footnote to selected text">¹<span className="rte-label"> Note</span></ToolbarButton>
        {editor.isActive('footnote') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetMark('footnote').run()} title="Remove Footnote">&#10060;</ToolbarButton>
        )}

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">&#9776;</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">&#9776;</ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">&#8630;</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">&#8631;</ToolbarButton>
      </div>

      {/* IMAGE EDIT POPOVER */}
      {imagePopover.visible && (
        <div className="rte-image-popover" style={{
          background: '#faf8f5',
          borderBottom: '1px solid #e8e3da',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}>
          <span style={{ fontWeight: 700, color: '#2d1b69' }}>🖼️ Image:</span>
          <input
            placeholder="Alt text"
            value={imagePopover.alt}
            onChange={(e) => { setImagePopover((p) => ({ ...p, alt: e.target.value })); updateImageAttr('alt', e.target.value) }}
            style={{ flex: '1 1 180px', padding: '0.35rem 0.6rem', border: '1px solid #e8e3da', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
          />
          <input
            placeholder="Caption (optional)"
            value={imagePopover.caption}
            onChange={(e) => { setImagePopover((p) => ({ ...p, caption: e.target.value })); updateImageAttr('data-caption', e.target.value) }}
            style={{ flex: '1 1 200px', padding: '0.35rem 0.6rem', border: '1px solid #e8e3da', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
          />
          <select
            value={imagePopover.alignment}
            onChange={(e) => { setImagePopover((p) => ({ ...p, alignment: e.target.value })); updateImageAttr('data-alignment', e.target.value) }}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #e8e3da', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
          >
            <option value="full">Full width</option>
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <select
            value={imagePopover.size}
            onChange={(e) => { setImagePopover((p) => ({ ...p, size: e.target.value })); updateImageAttr('data-size', e.target.value) }}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #e8e3da', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      )}

      {/* UPLOAD PROGRESS */}
      {uploadProgress && (
        <div style={{
          background: '#2d1b69',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>{uploadProgress}</div>
      )}

      {/* EDITOR */}
      <EditorContent editor={editor} />

      {/* FOOTER (word count + reading time) */}
      <div className="rte-footer" style={{
        padding: '0.5rem 1rem',
        borderTop: '1px solid #e8e3da',
        background: '#faf8f5',
        fontSize: '0.78rem',
        color: '#6a6560',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <span>{wordCount.toLocaleString()} word{wordCount === 1 ? '' : 's'} · ~{readingTime} min read</span>
        <span className="rte-tip" style={{ opacity: 0.6 }}>Tip: drag-and-drop or paste images anywhere in the editor</span>
      </div>

      {/* TOASTS */}
      <div className="rte-toasts" style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: t.kind === 'error' ? '#c0392b' : t.kind === 'success' ? '#27ae60' : '#2d1b69',
              color: '#fff',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              maxWidth: '320px',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* STYLES */}
      <style>{`
        .tiptap { outline: none; }
        .tiptap p { margin-bottom: 1rem; }
        .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; color: #0f0a2e; font-family: Georgia, serif; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #0f0a2e; font-family: Georgia, serif; }
        .tiptap ul, .tiptap ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .tiptap li { margin-bottom: 0.25rem; }
        .tiptap blockquote {
          border-left: 4px solid #f0c040;
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          background: rgba(240,192,64,0.05);
          font-style: italic;
          color: #2d1b69;
          border-radius: 0 8px 8px 0;
        }
        .tiptap a { color: #2d1b69; text-decoration: underline; }
        .tiptap mark { background: #ffd86e; padding: 0 2px; border-radius: 2px; }
        .tiptap hr { border: none; border-top: 2px solid #e8e3da; margin: 2rem 0; }
        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 2px 8px rgba(15,10,46,0.1);
        }
        .tiptap img[data-size="small"] { max-width: 320px; }
        .tiptap img[data-size="medium"] { max-width: 560px; }
        .tiptap img[data-alignment="left"] { float: left; margin: 0.5rem 1.5rem 1rem 0; clear: both; }
        .tiptap img[data-alignment="right"] { float: right; margin: 0.5rem 0 1rem 1.5rem; clear: both; }
        .tiptap img[data-alignment="center"] { margin-left: auto; margin-right: auto; clear: both; }
        .tiptap img[data-alignment="full"] { width: 100%; max-width: 100%; clear: both; }
        .tiptap img.ProseMirror-selectednode {
          outline: 3px solid #2d1b69;
          outline-offset: 2px;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9a9490;
          pointer-events: none;
          height: 0;
        }
        .tiptap:focus-within { box-shadow: inset 0 0 0 2px rgba(45,27,105,0.1); }
        .tiptap table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
          border-radius: 6px;
        }
        .tiptap th, .tiptap td {
          border: 1px solid #e8e3da;
          padding: 0.5rem 0.75rem;
          vertical-align: top;
          min-width: 60px;
        }
        .tiptap th { background: #faf8f5; font-weight: 700; text-align: left; }
        .tiptap iframe[src*="youtube"] { width: 100%; aspect-ratio: 16/9; border-radius: 8px; margin: 1.5rem 0; }
        .tiptap .footnote-mark {
          background: rgba(45,27,105,0.08);
          border-bottom: 1px dotted #2d1b69;
          padding: 0 2px;
          cursor: help;
          position: relative;
        }
        .tiptap .footnote-mark::after {
          content: '*';
          color: #2d1b69;
          font-weight: 700;
          font-size: 0.75em;
          vertical-align: super;
          margin-left: 1px;
        }

        /* Wide tables in body — make them scrollable instead of breaking layout */
        .tiptap table { display: block; overflow-x: auto; max-width: 100%; }

        /* MOBILE: editor compact */
        @media (max-width: 768px) {
          .rte-toolbar {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .rte-toolbar::-webkit-scrollbar { display: none; }
          .rte-toolbar button {
            min-width: 36px !important;
            min-height: 36px !important;
            padding: 0.45rem 0.4rem !important;
            flex-shrink: 0;
          }
          /* Hide the verbose " List", " Quote", " Image", etc. labels on mobile —
             icon alone is enough, freed-up space lets buttons hit 44px tap area */
          .rte-label { display: none; }

          /* Image popover — stack vertically with full-width controls */
          .rte-image-popover { flex-direction: column; align-items: stretch !important; gap: 0.5rem !important; }
          .rte-image-popover input,
          .rte-image-popover select {
            flex: 1 1 100% !important;
            font-size: 16px !important;
            padding: 0.6rem 0.75rem !important;
            min-height: 44px;
          }

          /* Footer — stack tip on its own line, drop the verbose tip on phones */
          .rte-footer { flex-direction: column; gap: 0.25rem !important; }
          .rte-tip { display: none; }

          /* Toasts — sit ABOVE the bottom mobile nav (60px) and span the screen width */
          .rte-toasts {
            bottom: 76px !important;
            left: 1rem !important;
            right: 1rem !important;
            align-items: stretch;
          }
          .rte-toasts > div { max-width: none !important; }

          /* Editor surface itself — slightly less padding on phones */
          .ProseMirror { padding: 1rem !important; min-height: 240px !important; }
        }

        @media (max-width: 480px) {
          .rte-toolbar button { min-width: 34px !important; padding: 0.4rem 0.3rem !important; }
        }
      `}</style>
    </div>
  )
}
