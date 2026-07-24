# SOP Operator — Jetis Sumur Data

## Akses panel
- URL panel **tidak dipublikasikan** di menu website.
- Masuk dengan **kode akses** (`ADMIN_PIN` di Vercel / `.env.local`).
- Sesi aktif ±12 jam.

## Tugas harian
1. Cek tab **Pengajuan** — setujui / tolak.
2. Cari warga (nama / NIK / No. KK).
3. **Tambah KK** jika ada keluarga baru (No. KK & NIK 16 digit).
4. **Export CSV** sebelum rapat / laporan.

## Mode data
| Mode | Arti |
|------|------|
| `mock` | Data demo di memori server (reset saat cold start) |
| `sheets` | Env Google terdeteksi — hubungkan adapter penuh |

## Google Sheets (produksi)
1. Buat spreadsheet dari template kolom di `PRD.md`.
2. Buat Service Account di Google Cloud, aktifkan Sheets API.
3. Share spreadsheet ke email service account (Editor).
4. Isi env: `SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
5. Redeploy.

## Keamanan
- Jangan bagikan PIN di grup warga.
- Jangan commit file JSON service account.
- Data real jangan di-commit ke GitHub (hanya seed demo).
