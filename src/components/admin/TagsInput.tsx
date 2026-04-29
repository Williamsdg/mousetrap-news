'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface TagsInputProps {
  value: string  // comma-separated string (matches existing schema)
  onChange: (next: string) => void
}

// Tag input with autocomplete against existing tags across articles.
// Tags are stored as a comma-separated string in parent state to match
// the existing article-editor data shape. Internally we keep them as an
// array for display and add/remove operations.
export default function TagsInput({ value, onChange }: TagsInputProps) {
  const tags = useMemo(() => parseTags(value), [value])
  const [allTags, setAllTags] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/tags')
      .then((res) => (res.ok ? res.json() : { tags: [] }))
      .then((data) => setAllTags(data.tags || []))
      .catch(() => {})
  }, [])

  // Filter suggestions by what's been typed, case-insensitive, excluding
  // tags already on this article. Cap at 8 so the dropdown stays scannable.
  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    if (!q) return []
    const taken = new Set(tags.map((t) => t.toLowerCase()))
    return allTags
      .filter((t) => t.toLowerCase().includes(q) && !taken.has(t.toLowerCase()))
      .slice(0, 8)
  }, [draft, allTags, tags])

  function commitTags(next: string[]) {
    onChange(next.join(', '))
  }

  function addTag(tag: string) {
    const t = tag.trim()
    if (!t) return
    const taken = new Set(tags.map((x) => x.toLowerCase()))
    if (taken.has(t.toLowerCase())) {
      setDraft('')
      return
    }
    commitTags([...tags, t])
    setDraft('')
    setActive(0)
  }

  function removeTag(idx: number) {
    commitTags(tags.filter((_, i) => i !== idx))
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const pick = open && suggestions[active] ? suggestions[active] : draft
      addTag(pick)
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      // Quick-remove the last tag when input is empty.
      commitTags(tags.slice(0, -1))
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault()
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="tags-input">
      <div
        className="tags-input__shell"
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        {tags.map((tag, i) => (
          <span key={tag + i} className="tags-input__chip">
            {tag}
            <button
              type="button"
              className="tags-input__chip-x"
              onClick={(e) => { e.stopPropagation(); removeTag(i) }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setOpen(true); setActive(0) }}
          onKeyDown={handleKey}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={tags.length === 0 ? 'Type a tag and press enter…' : ''}
          className="tags-input__entry"
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="tags-input__suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li key={s} className={i === active ? 'is-active' : ''}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                onMouseEnter={() => setActive(i)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="tags-input__hint">
        Press Enter or comma to add. {allTags.length > 0 && `${allTags.length} existing tags available.`}
      </div>
    </div>
  )
}

function parseTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
