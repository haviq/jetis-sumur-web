#!/usr/bin/env node
/**
 * Setup helper: Service Account JSON + Spreadsheet ID → .env.local + connection test
 *
 * Usage:
 *   node scripts/setup-sheets.mjs /path/to/sa.json SPREADSHEET_ID
 *   node scripts/setup-sheets.mjs /path/to/sa.json SPREADSHEET_ID --write-env
 *   node scripts/setup-sheets.mjs /path/to/sa.json SPREADSHEET_ID --bootstrap
 *
 * --write-env   merge into .env.local
 * --bootstrap   create kk/warga/pengajuan/meta tabs + headers if missing
 * --print-vercel  print values for Vercel UI (private key as one-line \n)
 */
import { createSign } from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function getAccessToken(email, privateKey) {
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
  const jwt = `${unsigned}.${b64url(sign.sign(privateKey))}`
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`token ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text).access_token
}

async function sheetsApi(token, spreadsheetId, path, init = {}) {
  const url = path.startsWith('http')
    ? path
    : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    const msg = json?.error?.message || text.slice(0, 300)
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${msg}`)
  }
  return json
}

const KK_H = [
  'id',
  'no_kk',
  'kepala_keluarga',
  'nik_kk',
  'rt',
  'rw',
  'alamat',
  'dusun',
  'status',
  'telepon',
  'catatan',
  'created_at',
  'updated_at',
]
const WARGA_H = [
  'id',
  'kk_id',
  'nik',
  'nama',
  'jk',
  'tempat_lahir',
  'tgl_lahir',
  'hubungan',
  'agama',
  'pendidikan',
  'pekerjaan',
  'status_kawin',
  'status',
  'updated_at',
]
const PG_H = [
  'id',
  'jenis',
  'nama_pelapor',
  'telepon',
  'payload_json',
  'status',
  'created_at',
  'reviewed_at',
  'admin_note',
]
const META_ROWS = [
  ['key', 'value'],
  ['padukuhan', 'Jetis Sumur'],
  ['schema_version', '1'],
  ['last_sync', new Date().toISOString()],
  ['kk_count', '0'],
  ['warga_count', '0'],
]

async function ensureTabs(token, spreadsheetId, titles) {
  const meta = await sheetsApi(token, spreadsheetId, '')
  const existing = new Set((meta.sheets || []).map((s) => s.properties?.title).filter(Boolean))
  const missing = titles.filter((t) => !existing.has(t))
  if (!missing.length) return { existing: [...existing], created: [] }
  await sheetsApi(token, spreadsheetId, ':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({
      requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
    }),
  })
  return { existing: [...existing], created: missing }
}

async function putHeader(token, spreadsheetId, range, values) {
  await sheetsApi(
    token,
    spreadsheetId,
    `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
    },
  )
}

function mergeEnvLocal(vars) {
  const path = resolve(process.cwd(), '.env.local')
  let lines = existsSync(path) ? readFileSync(path, 'utf8').split(/\r?\n/) : []
  const keys = Object.keys(vars)
  const kept = lines.filter((line) => {
    const k = line.split('=')[0]
    return !keys.includes(k)
  })
  for (const [k, v] of Object.entries(vars)) {
    // store private key as single-line with \n escapes
    const val = String(v).replace(/\n/g, '\\n')
    kept.push(`${k}=${val}`)
  }
  writeFileSync(path, kept.filter((l, i, a) => l || i < a.length - 1).join('\n') + '\n')
  return path
}

async function main() {
  const args = process.argv.slice(2)
  const writeEnv = args.includes('--write-env')
  const bootstrap = args.includes('--bootstrap')
  const printVercel = args.includes('--print-vercel')
  const pos = args.filter((a) => !a.startsWith('--'))
  if (pos.length < 2) {
    console.error(`Usage:
  node scripts/setup-sheets.mjs /path/to/sa.json SPREADSHEET_ID [--write-env] [--bootstrap] [--print-vercel]`)
    process.exit(1)
  }
  const saPath = resolve(pos[0])
  const spreadsheetId = pos[1].trim()
  if (!existsSync(saPath)) {
    console.error('SA file not found:', saPath)
    process.exit(1)
  }
  let sa
  try {
    sa = JSON.parse(readFileSync(saPath, 'utf8'))
  } catch (e) {
    console.error('Invalid JSON:', e.message)
    process.exit(1)
  }
  if (sa.type && sa.type !== 'service_account') {
    console.error('File is not a service_account JSON (type=%s)', sa.type)
    process.exit(1)
  }
  const email = sa.client_email
  const privateKey = String(sa.private_key || '').replace(/\\n/g, '\n')
  if (!email || !privateKey.includes('BEGIN')) {
    console.error('Missing client_email or private_key in JSON')
    process.exit(1)
  }

  console.log('Service account:', email)
  console.log('Spreadsheet ID:', spreadsheetId)
  console.log('Getting access token…')
  let token
  try {
    token = await getAccessToken(email, privateKey)
    console.log('✓ Google OAuth token OK')
  } catch (e) {
    console.error('✗ Token failed:', e.message)
    console.error('  → Enable Google Sheets API + check private key')
    process.exit(1)
  }

  console.log('Opening spreadsheet…')
  try {
    const meta = await sheetsApi(token, spreadsheetId, '?fields=properties,sheets.properties')
    console.log('✓ Spreadsheet OK:', meta.properties?.title || '(untitled)')
    console.log(
      '  Existing tabs:',
      (meta.sheets || []).map((s) => s.properties?.title).join(', ') || '(none)',
    )
  } catch (e) {
    console.error('✗ Cannot open spreadsheet:', e.message)
    console.error(`  → Share the spreadsheet with ${email} as Editor`)
    process.exit(1)
  }

  if (bootstrap) {
    console.log('Bootstrapping tabs…')
    const { created } = await ensureTabs(token, spreadsheetId, [
      'kk',
      'warga',
      'pengajuan',
      'meta',
    ])
    console.log('  Created tabs:', created.join(', ') || '(all existed)')
    await putHeader(token, spreadsheetId, 'kk!A1', [KK_H])
    await putHeader(token, spreadsheetId, 'warga!A1', [WARGA_H])
    await putHeader(token, spreadsheetId, 'pengajuan!A1', [PG_H])
    await putHeader(token, spreadsheetId, 'meta!A1', META_ROWS)
    console.log('✓ Headers written')
  }

  const oneLineKey = privateKey.replace(/\n/g, '\\n')
  if (writeEnv) {
    const path = mergeEnvLocal({
      SHEETS_SPREADSHEET_ID: spreadsheetId,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: email,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: oneLineKey,
    })
    console.log('✓ Wrote credentials into', path)
  }

  if (printVercel) {
    console.log('\n--- Paste into Vercel Environment Variables (Production) ---')
    console.log('SHEETS_SPREADSHEET_ID=')
    console.log(spreadsheetId)
    console.log('\nGOOGLE_SERVICE_ACCOUNT_EMAIL=')
    console.log(email)
    console.log('\nGOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=')
    console.log(oneLineKey)
    console.log('--- end ---\n')
  }

  console.log('\nDone. Next:')
  console.log('1) Set same vars on Vercel + ADMIN_PIN + Redeploy')
  console.log('2) Open /ops → add KK → check spreadsheet tabs')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
