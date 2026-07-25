import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Role, SessionUser } from './types'

const COOKIE = 'jetis_sess'
const MAX_AGE_SEC = 60 * 60 * 8 // 8 jam

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
    tenantId: user.tenantId || 'jetis-sumur',
    rtScope: user.rtScope || [],
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
      tenantId: data.tenantId || 'jetis-sumur',
      rtScope: Array.isArray(data.rtScope) ? data.rtScope : undefined,
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
  need: 'read' | 'write' | 'mutasi' | 'import' | 'master' | 'users' | 'audit' | 'settings' | 'print',
): boolean {
  if (role === 'super_admin') return true
  if (role === 'admin') return need !== 'users' && need !== 'settings'
  // padukuhan: CRUD + print + mutasi, no master/users/settings
  return need === 'read' || need === 'write' || need === 'mutasi' || need === 'import' || need === 'print'
}

/** Simple in-memory login rate limit (per instance / warm lambda) */
const loginHits = new Map<string, { n: number; reset: number }>()

export function checkLoginRate(ip: string, limit = 12, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const key = ip || 'unknown'
  const cur = loginHits.get(key)
  if (!cur || now > cur.reset) {
    loginHits.set(key, { n: 1, reset: now + windowMs })
    return true
  }
  cur.n += 1
  if (cur.n > limit) return false
  return true
}

export function clientIp(event: { node: { req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } } } }): string {
  const h = event.node.req.headers
  const xf = h['x-forwarded-for']
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim()
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(',')[0].trim()
  return event.node.req.socket?.remoteAddress || 'unknown'
}

export { COOKIE as SESS_COOKIE, MAX_AGE_SEC }
