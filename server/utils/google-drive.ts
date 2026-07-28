/**
 * Google Drive upload helper — pakai service account yang sama dengan Sheets.
 * Scope: drive.file (hanya file yang dibuat oleh app ini).
 */
import { createSign } from 'node:crypto'
import { sheetsEnv } from './google-auth'

const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FOLDER_NAME = 'Jetis Sumur Backup'

type TokenCache = { accessToken: string; exp: number }
const g = globalThis as unknown as { __jetisDriveToken?: TokenCache }

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function getDriveToken(): Promise<string> {
  const cached = g.__jetisDriveToken
  if (cached && Date.now() < cached.exp - 60_000) return cached.accessToken

  const { email, privateKey } = sheetsEnv()
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64url(
    JSON.stringify({ iss: email, scope: DRIVE_SCOPE, aud: TOKEN_URI, iat: now, exp: now + 3600 }),
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
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Drive token failed: ${res.status} ${t.slice(0, 200)}`)
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  g.__jetisDriveToken = { accessToken: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 }
  return data.access_token
}

/** Cari atau buat folder "Jetis Sumur Backup" di Drive service account */
async function ensureFolder(token: string): Promise<string> {
  // Cari folder existing
  const q = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  )
  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!listRes.ok) throw new Error(`Drive list folder failed: ${listRes.status}`)
  const listData = (await listRes.json()) as { files: { id: string }[] }
  if (listData.files.length > 0) return listData.files[0].id

  // Buat folder baru
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  if (!createRes.ok) throw new Error(`Drive create folder failed: ${createRes.status}`)
  const folder = (await createRes.json()) as { id: string }
  return folder.id
}

/** Upload JSON backup ke Google Drive ke folder yang sudah di-share ke service account */
export async function uploadBackupToDrive(bundle: unknown, folderId: string): Promise<{ fileId: string; fileName: string; url: string }> {
  const token = await getDriveToken()

  const fileName = `jetis-backup-${new Date().toISOString().slice(0, 16).replace('T', '_')}.json`
  const content = JSON.stringify(bundle, null, 2)

  // Multipart upload
  const boundary = '-------jetis_backup_boundary'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadata = JSON.stringify({ name: fileName, parents: [folderId] })
  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    metadata +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    },
  )
  if (!uploadRes.ok) {
    const t = await uploadRes.text()
    throw new Error(`Drive upload failed: ${uploadRes.status} ${t.slice(0, 300)}`)
  }
  const file = (await uploadRes.json()) as { id: string; name: string; webViewLink: string }
  return { fileId: file.id, fileName: file.name, url: file.webViewLink }
}
