'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
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

// Custom image extension that supports our data-sanity-asset attribute
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
    }
  },
})

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

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
        placeholder: 'Start writing your article...',
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
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 300px; padding: 1.5rem; font-family: Georgia, serif; font-size: 1.05rem; line-height: 1.8; color: #1a1715;',
      },
    },
  })

  // Update content if prop changes externally
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

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
      alert('Please choose an image file')
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      // No articleId — we don't want this image to overwrite the article's mainImage
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        alert(`Image upload failed: ${data.error || 'Unknown error'}`)
        return
      }

      const { _id: assetId, url } = data.asset
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: file.name })
        .updateAttributes('image', { 'data-sanity-asset': assetId })
        .run()
    } catch (err) {
      alert(`Upload error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setUploading(false)
    }
  }, [editor])

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleImageUpload(file)
      e.target.value = '' // reset so the same file can be re-uploaded
    },
    [handleImageUpload]
  )

  if (!editor) return null

  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
      {/* TOOLBAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.15rem',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #e8e3da',
        background: '#faf8f5',
      }}>
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <span style={{ background: '#ffd86e', padding: '0 3px', borderRadius: '2px' }}>H</span>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          &#8226; List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>

        <Divider />

        {/* Block types */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Block Quote"
        >
          &#10077; Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          &#8212;
        </ToolbarButton>

        <Divider />

        {/* Image */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title={uploading ? 'Uploading…' : 'Insert image'}
        >
          {uploading ? '⏳' : '🖼️'} Image
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          style={{ display: 'none' }}
        />

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insert Link"
        >
          &#128279; Link
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            &#10060;
          </ToolbarButton>
        )}

        <Divider />

        {/* Text alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          &#9776;
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          &#9776;
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          &#8630;
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          &#8631;
        </ToolbarButton>
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />

      {/* STYLES */}
      <style>{`
        .tiptap {
          outline: none;
        }
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
      `}</style>
    </div>
  )
}
