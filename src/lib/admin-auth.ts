import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'mousetrap-admin-secret-change-in-production'
)

// Users are stored as a JSON string in env var, or fall back to defaults
// Format: [{"email":"...","password":"...","name":"...","role":"publisher|writer"}]
function getUsers() {
  const envUsers = process.env.ADMIN_USERS
  if (envUsers) {
    try {
      return JSON.parse(envUsers) as Array<{
        email: string
        password: string
        name: string
        role: 'publisher' | 'writer'
      }>
    } catch {
      // Fall through to defaults
    }
  }

  // Default users — publisher + demo writer
  return [
    {
      email: process.env.ADMIN_EMAIL || 'admin@mousetrapnews.com',
      password: process.env.ADMIN_PASSWORD || 'mousetrap2026',
      name: 'Michael Morrow',
      role: 'publisher' as const,
    },
    {
      email: 'writer@mousetrapnews.com',
      password: 'writer2026',
      name: 'Staff Writer',
      role: 'writer' as const,
    },
  ]
}

export type UserRole = 'publisher' | 'writer'

export interface SessionUser {
  email: string
  name: string
  role: UserRole
}

export async function authenticateUser(email: string, password: string) {
  const users = getUsers()
  const user = users.find(
    (u) => u.email === email && u.password === password
  )
  if (!user) return null
  return { email: user.email, name: user.name, role: user.role } as SessionUser
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}

// Permission checks
export function canApprove(role: UserRole) {
  return role === 'publisher'
}

export function canDelete(role: UserRole) {
  return role === 'publisher'
}

export function canChangeStatus(role: UserRole, from: string, to: string) {
  if (role === 'publisher') return true // Publisher can do anything

  // Writers can only: draft → in-review, rejected → draft
  if (role === 'writer') {
    if (from === 'draft' && to === 'in-review') return true
    if (from === 'rejected' && to === 'draft') return true
    return false
  }

  return false
}
