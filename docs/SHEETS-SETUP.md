# Google Sheets setup — Jetis Sumur Data

## 1. Buat spreadsheet
1. Buka [Google Sheets](https://sheets.google.com) → blank spreadsheet.
2. Rename: `Jetis Sumur — Pendataan Warga`.
3. Copy **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`

## 2. Service Account
1. [Google Cloud Console](https://console.cloud.google.com/) → project baru / existing.
2. Enable **Google Sheets API**.
3. IAM → Service Accounts → Create.
4. Keys → Add key → JSON → download.
5. Dari JSON ambil:
   - `client_email`
   - `private_key` (termasuk `BEGIN PRIVATE KEY` … `END PRIVATE KEY`)

## 3. Share spreadsheet
Share spreadsheet ke **email service account** dengan role **Editor**.

## 4. Environment variables

```bash
SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_PIN=your-long-pin
```

Private key: escape newline jadi `\n` dalam satu baris, atau paste multi-line di Vercel UI.
Boleh juga base64-encode seluruh PEM.

## 5. Tab otomatis
Saat app start (mode sheets), tab dibuat jika belum ada:
- `kk`
- `warga`
- `pengajuan`
- `meta`

Jika sheet kosong, seed demo di-push sekali.

## 6. Verifikasi
1. Login `/ops`
2. Tambah KK
3. Buka spreadsheet → baris baru muncul
4. `GET /api/health` (saat login operator) menampilkan status Sheets

## Catatan
- Tanpa env Sheets → mode **mock** (memori, cocok demo).
- Cold start serverless: data di-hydrate ulang dari Sheets.
- Jangan commit file JSON service account.
