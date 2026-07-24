/**
 * Google Sheets adapter — scaffold.
 * When env is complete, replace mock writes with Sheets API.
 * V1 ships with mock DB so product works before credentials exist.
 *
 * Setup later:
 * 1. Create Google Cloud project + enable Sheets API
 * 2. Service account → download JSON
 * 3. Share spreadsheet with SA email (Editor)
 * 4. Set SHEETS_SPREADSHEET_ID + GOOGLE_SERVICE_ACCOUNT_*
 */
export function sheetsConfigured(): boolean {
  return Boolean(
    process.env.SHEETS_SPREADSHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  )
}

export async function pingSheets(): Promise<{ ok: boolean; message: string }> {
  if (!sheetsConfigured()) {
    return {
      ok: false,
      message: 'Sheets belum dikonfigurasi — memakai database demo (memori).',
    }
  }
  // Full googleapis integration in next iteration
  return {
    ok: true,
    message: 'Env Sheets terdeteksi. Adapter penuh: hubungkan googleapis (next sprint).',
  }
}
