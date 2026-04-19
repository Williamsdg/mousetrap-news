'use client'

import { useMemo, type ReactNode } from 'react'
import { type ThemeConfig, themeToCSSVars } from './themes'

interface ThemeWrapperProps {
  theme: ThemeConfig
  children: ReactNode
}

export default function ThemeWrapper({ theme, children }: ThemeWrapperProps) {
  const cssVars = useMemo(() => themeToCSSVars(theme), [theme])

  return (
    <div
      style={{
        ...cssVars as React.CSSProperties,
        background: 'var(--off-white)',
        color: 'var(--near-black)',
      }}
      data-theme={theme.id}
    >
      {children}
    </div>
  )
}
