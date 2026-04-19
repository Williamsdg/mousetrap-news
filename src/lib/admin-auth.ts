import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'mousetrap-admin-secret-change-in-production'
)

const ADMIN_USERS = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@mousetrapnews.com',
    password: process.env.ADMIN_PASSWORD || 'mousetrap2026',
    name: 'Michael Morrow',
    role: 'publisher',
  },
]

export async function authenticateUser(email: string, password: string) {
  const user = ADMIN_USERS.find(
    (u) => u.email === email && u.password === password
  )
  if (!user) return null
  return { email: user.email, name: user.name, role: user.role }
}

export async function createSession(user: { email: string; name: string; role: string }) {
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { email: string; name: string; role: string }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}
