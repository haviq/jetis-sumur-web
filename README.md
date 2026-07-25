# Sistem Informasi Pendataan Warga — Padukuhan Jetis Sumur

**Stack (sesuai PRD):** Nuxt 3 · Vue 3 · TypeScript · Tailwind · Pinia · Google Sheets · Vercel

Live: https://jetis-sumur-web.vercel.app

## Fitur

### Website publik
- Beranda, Profil, Struktur, Statistik, Berita, Kontak
- Statistik agregat (tanpa NIK/nama/HP)
- Dark/light mode

### Dashboard pengelola (`/ops` — **tidak ada di menu publik**)
| Role | Akses |
|------|--------|
| Padukuhan | Dashboard, CRUD KK/warga, mutasi, export |
| Admin | + master data, audit log |
| Super Admin | + kelola pengguna |

### Database
Google Spreadsheet tabs: `akun`, `keluarga`, `warga`, `mutasi`, `log_aktivitas`, `master`, `berita`

## Akun demo
| Username | Password | Role |
|----------|----------|------|
| superadmin | superadmin2026 | Super Admin |
| admin | admin2026 | Admin |
| padukuhan | padukuhan2026 | Padukuhan |

## Setup lokal

```bash
cp .env.example .env
# isi SHEETS_SPREADSHEET_ID + GOOGLE_SERVICE_ACCOUNT_*
pnpm install
pnpm dev
```

## Env Vercel
- `AUTH_SECRET`
- `ADMIN_PIN` (opsional fallback)
- `SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (PEM, baris diganti `\n`)
- `NUXT_PUBLIC_SITE_URL`

Share spreadsheet ke service account sebagai **Editor**.

## PRD
Lihat `docs/PRD-v2.md`.
