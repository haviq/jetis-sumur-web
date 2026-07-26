// POST /api/push/send — kirim Web Push ke semua subscriber
// Auth: admin minimum
// VAPID + enkripsi penuh (RFC 8030/8291/8292) via globalThis.crypto.subtle
// Tidak butuh paket web-push atau node:crypto import

import { listPushSubs } from './subscribe.post'

// ─── Util: base64url ──────────────────────────────────────────────────────────

function b64uToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - (s.length % 4)) % 4, '=')
  const bin = atob(b64)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function bytesToB64u(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const a of arrays) { out.set(a, off); off += a.length }
  return out
}

// ─── VAPID JWT (ES256) via crypto.subtle ─────────────────────────────────────

async function makeVapidJwt(audience: string, subject: string, privateKeyB64u: string): Promise<string> {
  const wc = globalThis.crypto.subtle
  const enc = new TextEncoder()

  const header = bytesToB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const now = Math.floor(Date.now() / 1000)
  const payload = bytesToB64u(enc.encode(JSON.stringify({ aud: audience, exp: now + 43200, sub: subject })))
  const sigInput = `${header}.${payload}`

  // Import raw P-256 private key (32 bytes) as PKCS8
  // PKCS8 wrapper for P-256: fixed ASN.1 header + 32-byte raw key
  const rawKey = b64uToBytes(privateKeyB64u)
  // ASN.1 PKCS8 structure for P-256 private key (without public key component)
  // SEQUENCE { version INTEGER(0), AlgorithmIdentifier { ecPublicKey OID, prime256v1 OID }, ECPrivateKey }
  const pkcs8Header = new Uint8Array([
    0x30, 0x41,             // SEQUENCE (65 bytes)
      0x02, 0x01, 0x00,     // INTEGER 0 (version)
      0x30, 0x13,           // SEQUENCE (AlgorithmIdentifier, 19 bytes)
        0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ecPublicKey
        0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID prime256v1
      0x04, 0x27,           // OCTET STRING (39 bytes)
        0x30, 0x25,         // SEQUENCE ECPrivateKey (37 bytes)
          0x02, 0x01, 0x01, // INTEGER 1 (version)
          0x04, 0x20,       // OCTET STRING (32 bytes) — private key follows
  ])
  const pkcs8 = concat(pkcs8Header, rawKey)

  const key = await wc.importKey(
    'pkcs8',
    pkcs8,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const sig = await wc.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(sigInput))
  return `${sigInput}.${bytesToB64u(sig)}`
}

// ─── RFC 8291 payload encryption (aes128gcm) via crypto.subtle ───────────────

async function encryptPayload(
  plaintext: string,
  p256dhB64u: string,
  authB64u: string
): Promise<Uint8Array> {
  const wc = globalThis.crypto.subtle
  const enc = new TextEncoder()

  const subscriberPub = b64uToBytes(p256dhB64u) // 65 bytes uncompressed P-256
  const authSecret = b64uToBytes(authB64u)       // 16 bytes

  // 1. Ephemeral P-256 key pair
  const eph = await wc.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const ephPubRaw = new Uint8Array(await wc.exportKey('raw', eph.publicKey)) // 65 bytes

  // 2. Import subscriber public key for ECDH
  const subKey = await wc.importKey('raw', subscriberPub, { name: 'ECDH', namedCurve: 'P-256' }, false, [])

  // 3. ECDH shared secret (32 bytes)
  const ecdhSecret = new Uint8Array(await wc.deriveBits({ name: 'ECDH', public: subKey }, eph.privateKey, 256))

  // 4. Random salt (16 bytes)
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))

  // 5. PRK via HKDF-Extract(auth_secret, ecdh_secret) with info = "WebPush: info\0" + subPub + ephPub
  const keyInfo = concat(enc.encode('WebPush: info\x00'), subscriberPub, ephPubRaw)
  const ikmKey = await wc.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits'])
  const prk = new Uint8Array(await wc.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
    ikmKey, 256
  ))

  // 6. CEK (16 bytes) and nonce (12 bytes) from PRK
  const prkKey1 = await wc.importKey('raw', prk, 'HKDF', false, ['deriveBits'])
  const cekInfo = concat(enc.encode('Content-Encoding: aes128gcm\x00'), new Uint8Array([1]))
  const cekBits = new Uint8Array(await wc.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo },
    prkKey1, 128
  ))

  const prkKey2 = await wc.importKey('raw', prk, 'HKDF', false, ['deriveBits'])
  const nonceInfo = concat(enc.encode('Content-Encoding: nonce\x00'), new Uint8Array([1]))
  const nonceBits = new Uint8Array(await wc.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo },
    prkKey2, 96
  ))

  // 7. AES-128-GCM encrypt (add \x02 padding delimiter)
  const aesKey = await wc.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt'])
  const record = concat(enc.encode(plaintext), new Uint8Array([2]))
  const ciphertext = new Uint8Array(await wc.encrypt(
    { name: 'AES-GCM', iv: nonceBits, tagLength: 128 },
    aesKey, record
  ))

  // 8. aes128gcm content body: salt(16) + rs(4) + idlen(1) + ephPub(65) + ciphertext
  const rs = new Uint8Array([0x00, 0x00, 0x10, 0x00]) // 4096
  return concat(salt, rs, new Uint8Array([65]), ephPubRaw, ciphertext)
}

// ─── Send one push ────────────────────────────────────────────────────────────

async function sendOnePush(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  payload: string,
  vapidPublic: string,
  vapidPrivate: string,
  vapidSubject: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const url = new URL(endpoint)
    const audience = `${url.protocol}//${url.host}`
    const jwt = await makeVapidJwt(audience, vapidSubject, vapidPrivate)
    const encrypted = await encryptPayload(payload, keys.p256dh, keys.auth)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `vapid t=${jwt},k=${vapidPublic}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        TTL: '86400',
        Urgency: 'normal',
      },
      body: encrypted,
    })

    if (res.status === 201 || res.status === 200 || res.status === 202) return { ok: true, status: res.status }
    if (res.status === 410 || res.status === 404) return { ok: false, status: res.status, error: 'expired' }
    const text = await res.text().catch(() => '')
    return { ok: false, status: res.status, error: text.slice(0, 120) }
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) }
  }
}

// ─── Notification history (in-memory, shared via globalThis) ─────────────────

type NotifRecord = {
  id: string
  title: string
  body: string
  url: string
  sentAt: string
  sent: number
  total: number
}

const gh = globalThis as unknown as { __notifHistory?: NotifRecord[] }
function notifHistory(): NotifRecord[] {
  if (!gh.__notifHistory) gh.__notifHistory = []
  return gh.__notifHistory
}

export function listNotifHistory(): NotifRecord[] {
  return notifHistory().slice().reverse()
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  if (user.role === 'padukuhan') {
    throw createError({ statusCode: 403, statusMessage: 'perlu role admin' })
  }

  const body = await readBody<{ title?: string; body?: string; url?: string }>(event)
  if (!body?.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'title wajib' })

  const vapidPublic = (process.env.VAPID_PUBLIC_KEY || '').trim()
  const vapidPrivate = (process.env.VAPID_PRIVATE_KEY || '').trim()
  if (!vapidPublic || !vapidPrivate) {
    throw createError({ statusCode: 503, statusMessage: 'VAPID belum dikonfigurasi di environment' })
  }

  const vapidSubject = `mailto:${(process.env.VAPID_SUBJECT || 'admin@jetis-sumur.id').trim()}`
  const payload = JSON.stringify({
    title: body.title.trim(),
    body: (body.body || '').trim(),
    url: (body.url || '/ops').trim(),
  })

  const subs = listPushSubs()
  let sent = 0
  const expired: string[] = []

  const results = await Promise.allSettled(
    subs.map((sub) =>
      sendOnePush(sub.endpoint, sub.keys, payload, vapidPublic, vapidPrivate, vapidSubject)
    )
  )

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      if (r.value.ok) sent++
      else if (r.value.error === 'expired') expired.push(subs[i].endpoint)
    }
  })

  // Hapus subscriptions yang expired / unsubscribed dari push service
  const gs = globalThis as unknown as { __pushSubs?: Map<string, unknown> }
  if (gs.__pushSubs) {
    for (const ep of expired) gs.__pushSubs.delete(ep)
  }

  // Simpan ke history (max 100 entri)
  const hist = notifHistory()
  hist.push({
    id: `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    title: body.title.trim(),
    body: (body.body || '').trim(),
    url: (body.url || '/ops').trim(),
    sentAt: new Date().toISOString(),
    sent,
    total: subs.length,
  })
  if (hist.length > 100) hist.splice(0, hist.length - 100)

  addLog(user.username, `push_send "${body.title}" sent=${sent}/${subs.length}`)
  return { ok: true, sent, total: subs.length, expiredRemoved: expired.length }
})
