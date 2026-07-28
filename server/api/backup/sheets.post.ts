/**
 * POST /api/backup/sheets
 * Simpan backup bundle ke sheet "backup" di Spreadsheet yang sama.
 * Tiap klik = 1 row baru: | timestamp | version | json_bundle |
 * Max 50 row — row lama otomatis dihapus kalau sudah penuh.
 */
import { exportBackupBundle, ensureHydrated } from '~/server/utils/db'
import { sessionFromEvent, canAccess } from '~/server/utils/auth'
import { addLog } from '~/server/utils/db'
import { sheetsFetch, ensureSheetTabs } from '~/server/utils/google-auth'

const SHEET_NAME = 'backup'
const MAX_ROWS = 50

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'backup')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()
  const bundle = exportBackupBundle()
  const ts = new Date().toISOString()
  const version = String((bundle as any).version || 3)
  const json = JSON.stringify(bundle)

  // Pastikan sheet "backup" ada
  await ensureSheetTabs([SHEET_NAME])

  // Ambil data existing untuk hitung jumlah row
  const getRes = await sheetsFetch(`/values/${encodeURIComponent(SHEET_NAME)}!A:A`)
  if (!getRes.ok) {
    const t = await getRes.text()
    throw createError({ statusCode: 502, statusMessage: `Sheets read failed: ${t.slice(0, 100)}` })
  }
  const getData = (await getRes.json()) as { values?: string[][] }
  const existingRows = (getData.values || []).length

  // Hapus row lama kalau sudah >= MAX_ROWS (keep header + last MAX_ROWS-1 rows)
  if (existingRows >= MAX_ROWS) {
    // Hapus baris kedua (baris pertama setelah header)
    const spreadsheetRes = await sheetsFetch('')
    const spreadsheetData = (await spreadsheetRes.json()) as { sheets?: { properties?: { title?: string; sheetId?: number } }[] }
    const sheetId = spreadsheetData.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME,
    )?.properties?.sheetId ?? 0

    await sheetsFetch(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 2 },
          },
        }],
      }),
    })
  }

  // Append row baru
  const appendRes = await sheetsFetch(
    `/values/${encodeURIComponent(SHEET_NAME)}!A:C:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({ values: [[ts, version, json]] }),
    },
  )
  if (!appendRes.ok) {
    const t = await appendRes.text()
    throw createError({ statusCode: 502, statusMessage: `Sheets write failed: ${t.slice(0, 100)}` })
  }

  addLog(user.username, 'backup_sheets', `ts: ${ts}`)

  return { ok: true, timestamp: ts, rowCount: Math.min(existingRows + 1, MAX_ROWS), spreadsheetId: (process.env.SHEETS_SPREADSHEET_ID || '').trim() }
})
