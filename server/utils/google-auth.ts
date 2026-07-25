/**
 * Google Service Account JWT (Sheets scope) — no googleapis dependency.
 */
import { createSign } from 'node:crypto'

const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

type TokenCache = { accessToken: string; exp: number }
const g = globalThis as unknown as { __jetisSaToken?: TokenCache }

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function normalizePrivateKey(raw: string): string {
  let k = raw.trim()
  if (!k.includes('BEGIN') && /^[A-Za-z0-9+/=\s]+$/.test(k) && k.length > 100) {
    try {
      k = Buffer.from(k.replace(/\s+/g, ''), 'base64').toString('utf8')
    } catch {
      /* keep */
    }
  }
  k = k.replace(/\\n/g, '\n')
  return k
}

export function sheetsEnv() {
  return {
    spreadsheetId: (process.env.SHEETS_SPREADSHEET_ID || '').trim(),
    email: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim(),
    privateKey: normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || ''),
  }
}

export function sheetsConfigured(): boolean {
  const e = sheetsEnv()
  return Boolean(e.spreadsheetId && e.email && e.privateKey.includes('BEGIN'))
}

async function getAccessToken(): Promise<string> {
  const cached = g.__jetisSaToken
  if (cached && Date.now() < cached.exp - 60_000) return cached.accessToken

  const { email, privateKey } = sheetsEnv()
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URI,
      iat: now,
      exp: now + 3600,
    }),
  )
  const unsigned = `${header}.${claim}`
  const sign = createSign('RSA-SHA256')
  sign.update(unsigned)
  sign.end()
  const signature = b64url(sign.sign(privateKey))
  const jwt = `${unsigned}.${signature}`

  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Google token failed: ${res.status} ${t.slice(0, 200)}`)
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  g.__jetisSaToken = {
    accessToken: data.access_token,
    exp: Date.now() + (data.expires_in || 3600) * 1000,
  }
  return data.access_token
}

export async function sheetsFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken()
  const { spreadsheetId } = sheetsEnv()
  const url = path.startsWith('http')
    ? path
    : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
}

export async function ensureSheetTabs(titles: string[]): Promise<void> {
  const res = await sheetsFetch('')
  if (!res.ok) return
  const data = (await res.json()) as {
    sheets?: { properties?: { title?: string } }[]
  }
  const existing = new Set((data.sheets || []).map((s) => s.properties?.title || ''))
  const missing = titles.filter((t) => !existing.has(t))
  if (!missing.length) return
  await sheetsFetch(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({
      requests: missing.map((title) => ({
        addSheet: { properties: { title } },
      })),
    }),
  })
}
