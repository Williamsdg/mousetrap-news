'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="admin-mobile-nav">
      <div className="admin-mobile-nav-inner">
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
          <span className="mob-icon">📰</span>
          Articles
        </Link>
        <Link href="/admin/articles/new" className={pathname === '/admin/articles/new' ? 'active' : ''}>
          <span className="mob-icon">✏️</span>
          New
        </Link>
        <Link href="/admin/categories" className={pathname === '/admin/categories' ? 'active' : ''}>
          <span className="mob-icon">🏷️</span>
          Categories
        </Link>
        <a href="/" target="_blank">
          <span className="mob-icon">🌐</span>
          Site
        </a>
        {onLogout && (
          <button onClick={onLogout}>
            <span className="mob-icon">🚪</span>
            Logout
          </button>
        )}
      </div>
    </div>
  )
}
