'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SearchFormProps {
  initialQ: string
  initialCategory: string
  categories: { slug: string; title: string; icon?: string }[]
}

export default function SearchForm({ initialQ, initialCategory, categories }: SearchFormProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const trimmed = q.trim()
    if (trimmed) params.set('q', trimmed)
    if (category) params.set('category', category)
    const qs = params.toString()
    router.push(qs ? `/search?${qs}` : '/search')
  }

  function clear() {
    setQ('')
    setCategory('')
    router.push('/search')
  }

  return (
    <form onSubmit={submit} className="search-form" role="search">
      <div className="search-form__row">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by article name…"
          aria-label="Search articles by name"
          className="search-form__input"
          autoComplete="off"
        />
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="search-form__select"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon ? `${c.icon} ` : ''}{c.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-glow search-form__submit">
          Search
        </button>
      </div>
      {(q || category) && (
        <button type="button" className="search-form__clear" onClick={clear}>
          Clear filters
        </button>
      )}
    </form>
  )
}
