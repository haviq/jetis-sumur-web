/**
 * Admin PIN session — cookie HMAC-ish token.
 * Set ADMIN_PIN in env for production.
 */
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE = 'jetis_ops'
const MAX_AGE_SEC = 60 * 60 * 12

export function getAdminPin(): string {
  const v = (process.env.ADMIN_PIN || '').trim()
  if (v.length >= 4) return v
  return 'jetis2026'
}

export function isPinFromEnv(): boolean {
  return (process.env.ADMIN_PIN || '').trim().length >= 4
}

function secret(): string {
  return getAdminPin() + '|jetis-sumur-ops'
}

export function mintToken(now = Date.now()): string {
  const exp = now + MAX_AGE_SEC * 1000
  const payload = `ops:${exp}`
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false
  try {
    const [p, sig] = token.split('.')
    if (!p || !sig) return false
    const payload = Buffer.from(p, 'base64url').toString('utf8')
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const exp = Number(payload.split(':')[1] || 0)
    return Boolean(exp && Date.now() <= exp)
  } catch {
    return false
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

export function readCookie(header: string | null): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === COOKIE) return rest.join('=') || null
  }
  return null
}

export function requestIsAdmin(req: Request): boolean {
  return verifyToken(readCookie(req.headers.get('cookie')))
}

export function secretsEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

export { COOKIE as OPS_COOKIE, MAX_AGE_SEC }
