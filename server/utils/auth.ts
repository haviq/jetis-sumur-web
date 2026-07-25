import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Role, SessionUser } from './types'

const COOKIE = 'jetis_sess'
const MAX_AGE_SEC = 60 * 60 * 12

function secret(): string {
  return (
    (process.env.AUTH_SECRET || '').trim() ||
    (process.env.ADMIN_PIN || '').trim() ||
    'jetis-sumur-dev-secret'
  )
}

export function hashPassword(password: string, salt?: string): string {
  const s = salt || randomBytes(16).toString('hex')
  const hash = scryptSync(password, s, 32).toString('hex')
  return `${s}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [s, h] = stored.split(':')
    if (!s || !h) return false
    const hash = scryptSync(password, s, 32).toString('hex')
    const a = Buffer.from(h)
    const b = Buffer.from(hash)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function mintSession(user: SessionUser, now = Date.now()): string {
  const exp = now + MAX_AGE_SEC * 1000
  const payload = JSON.stringify({
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
    exp,
  })
  const body = Buffer.from(payload).toString('base64url')
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifySession(token: string | undefined | null): SessionUser | null {
  if (!token) return null
  try {
    const [body, sig] = token.split('.')
    if (!body || !sig) return null
    const expected = createHmac('sha256', secret()).update(body).digest('base64url')
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionUser & {
      exp: number
    }
    if (!data.exp || Date.now() > data.exp) return null
    if (!data.id || !data.role || !data.username) return null
    return {
      id: data.id,
      nama: data.nama,
      username: data.username,
      role: data.role as Role,
    }
  } catch {
    return null
  }
}

export function cookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure ? '; Secure' : ''}`
}

export function clearCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
}

export function readCookie(header: string | null | undefined): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === COOKIE) return rest.join('=') || null
  }
  return null
}

export function sessionFromEvent(event: { node: { req: { headers: { cookie?: string } } } }): SessionUser | null {
  return verifySession(readCookie(event.node.req.headers.cookie))
}

export function canAccess(
  role: Role,
  need: 'read' | 'write' | 'mutasi' | 'import' | 'master' | 'users' | 'audit' | 'settings',
): boolean {
  if (role === 'super_admin') return true
  if (role === 'admin') return need !== 'users' && need !== 'settings'
  return need === 'read' || need === 'write'
}

export { COOKIE as SESS_COOKIE, MAX_AGE_SEC }
