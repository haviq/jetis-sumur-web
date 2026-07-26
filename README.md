<div align="center">

# 🏘 Jetis Sumur — Sistem Informasi Pendataan Warga

**Platform pendataan warga digital untuk Padukuhan Jetis Sumur, DI Yogyakarta**

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.17-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?style=flat-square&logo=pinia&logoColor=black)](https://pinia.vuejs.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Google Sheets](https://img.shields.io/badge/DB-Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)](https://sheets.google.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

<br/>

**[🌐 Live Demo](https://jetis-sumur-web.vercel.app)** · **[📊 Statistik Publik](https://jetis-sumur-web.vercel.app/statistik)** · **[📋 Dokumentasi API](#api-endpoints)**

<br/>

> Data KK, jiwa, mutasi, dan statistik kependudukan — dikelola pengurus,
> dibaca publik. Tanpa database server, tanpa biaya hosting mahal.

</div>

---

## ✨ Highlights

- 🔐 **Multi-role auth** — `superadmin / admin / padukuhan` dengan akses granular
- 📊 **Dashboard ops lengkap** — KK, jiwa, mutasi, surat, laporan, peta, audit log
- 🗄️ **Zero-database-server** — Google Sheets sebagai backend, hemat biaya
- 🎨 **Cinematic UI** — preloader dual-curtain, film grain, canvas particles, dark+emerald
- 📱 **PWA-ready** — bisa di-install di HP, mobile-first
- 🔏 **Privacy-first** — NIK & data sensitif tidak pernah tampil di halaman publik
- 📄 **PDF generator** — surat keterangan dengan QR verifikasi
- 🔍 **Pencarian global** — cari warga/KK dari satu kotak pencarian
- 📥 **Import massal** — wizard CSV/Excel dengan validasi & preview
- 📡 **Audit trail** — semua aksi pengurus tercatat dengan IP + timestamp

---

## 🏗 Arsitektur

```
╔══════════════════════════════════════════════════════════════╗
║                    FRONTEND — Nuxt 3 SSR                    ║
║  Vue 3 · Pinia · Tailwind CSS · TypeScript                  ║
║  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐          ║
║  │ Beranda │ │Statistik │ │ Profil │ │  Berita  │  ...      ║
║  └─────────┘ └──────────┘ └────────┘ └──────────┘          ║
╚══════════════════════════╦═══════════════════════════════════╝
                           ║ /api/* (Nitro H3)
╔══════════════════════════╩═══════════════════════════════════╗
║                    BACKEND — Nitro (H3)                     ║
║  JWT httpOnly cookie · Rate limiting · Audit log            ║
║  Auth middleware · PDF generator · Import wizard            ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ║
║  │   Auth   │ │  Warga   │ │  Surat   │ │  Stats   │  ...  ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ║
╚══════════════════════════╦═══════════════════════════════════╝
                           ║ Google Sheets API v4
╔══════════════════════════╩═══════════════════════════════════╗
║              DATABASE — Google Sheets                       ║
║  Warga · KK · Mutasi · Berita · Akun · Log · Surat · ...    ║
║  Service Account OAuth2 (server-only, zero client exposure) ║
╚══════════════════════════════════════════════════════════════╝
```

### Stack overview

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Nuxt 3 | `^3.17.5` |
| UI | Vue 3 | `^3.5.17` |
| Routing | Vue Router | `^4.5.1` |
| State | Pinia + @pinia/nuxt | `^3.0.3` |
| Styling | Tailwind CSS + custom CSS | `^6.14.0` |
| Language | TypeScript | `^5.9.2` |
| Runtime | Nitro (H3) | bundled |
| Database | Google Sheets API v4 | REST |
| Auth | Google Service Account | JWT OAuth2 |
| Deploy | Vercel (Nitro preset) | edge SSR |
| Fonts | Source Sans 3 + Source Serif 4 | Google Fonts |
| Package Manager | pnpm | `9.15.0` |

---

## 🗂 Struktur Proyek

```
jetis-sumur-web/
├── 📁 pages/
│   ├── index.vue                 # Beranda — hero, statistik, berita
│   ├── statistik.vue             # Grafik & tabel kependudukan
│   ├── profil/index.vue          # Profil padukuhan
│   ├── berita/index.vue          # Berita & pengumuman
│   ├── layanan.vue               # Layanan administrasi
│   ├── kontak.vue                # Kontak pengurus
│   ├── verifikasi.vue            # Verifikasi surat via QR
│   ├── privasi.vue               # Kebijakan privasi
│   └── 📁 ops/                   # ⚠️  Unlisted — hanya pengurus
│       ├── index.vue             # Dashboard ringkasan
│       ├── warga.vue             # CRUD jiwa/penduduk
│       ├── kk.vue                # Manajemen Kartu Keluarga
│       ├── mutasi.vue            # Mutasi: lahir, meninggal, pindah
│       ├── cari.vue              # Pencarian global
│       ├── surat.vue             # Surat keterangan + PDF
│       ├── laporan.vue           # Rekap + export
│       ├── import.vue            # Import CSV/Excel wizard
│       ├── backup.vue            # Backup & restore Sheets
│       ├── peta.vue              # Peta sebaran per RT
│       ├── portal.vue            # Konten halaman publik
│       ├── master.vue            # Data master (RT, jabatan)
│       ├── log.vue               # Audit log semua aksi
│       └── akun.vue              # Manajemen akun (superadmin)
│
├── 📁 server/
│   ├── 📁 api/                   # H3 route handlers
│   │   ├── auth/                 # login · logout · session
│   │   ├── warga/                # CRUD penduduk
│   │   ├── keluarga/             # CRUD KK
│   │   ├── mutasi/               # Mutasi warga
│   │   ├── surat/                # Surat + arsip
│   │   ├── akun/                 # User management
│   │   ├── master/               # Data referensi
│   │   ├── portal/               # Konten publik
│   │   ├── import/               # Import wizard
│   │   ├── stats.get.ts          # Statistik publik
│   │   ├── search.get.ts         # Pencarian global
│   │   ├── export.get.ts         # Export CSV
│   │   ├── print.get.ts          # PDF generator
│   │   ├── backup.{get,post}.ts  # Backup/restore
│   │   ├── kk360.get.ts          # Profil KK lengkap
│   │   ├── map.get.ts            # Data peta
│   │   ├── berita.get.ts         # Berita publik
│   │   ├── logs.get.ts           # Audit log
│   │   ├── verify.get.ts         # Verifikasi surat
│   │   ├── wa.post.ts            # WA notifikasi
│   │   ├── onboard.post.ts       # Setup awal
│   │   ├── health.get.ts         # Health check
│   │   └── validate/nik.post.ts  # Validasi NIK
│   └── 📁 utils/
│       ├── sheets.ts             # Google Sheets read/write
│       ├── auth.ts               # JWT + session + rate limit
│       ├── db.ts                 # Abstraksi DB layer
│       ├── google-auth.ts        # Service Account OAuth2
│       ├── tenant.ts             # Multi-tenant config
│       ├── types.ts              # Type definitions
│       ├── helpers.ts            # Utility functions
│       ├── print.ts              # HTML→PDF generator
│       ├── import.ts             # CSV/Excel parser
│       ├── validate.ts           # Validasi NIK, data
│       └── seed.ts               # Seed akun superadmin
│
├── 📁 layouts/
│   └── default.vue               # Shell: header, footer, preloader, atm
├── 📁 stores/
│   └── auth.ts                   # Pinia: auth state
├── 📁 composables/
│   └── useSite.ts                # Site/branding config
├── 📁 assets/css/
│   └── main.css                  # Design tokens + semua komponen
├── 📁 public/
│   ├── icon.svg
│   └── manifest.webmanifest      # PWA manifest
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🎯 Fitur Lengkap

### 🌐 Portal Publik

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Beranda | `/` | Hero, statistik ringkas, chart umur, per-RT, berita terbaru |
| Statistik | `/statistik` | Grafik & tabel kependudukan lengkap |
| Profil | `/profil` | Profil, sejarah, visi-misi padukuhan |
| Struktur | `/struktur` | Struktur pengurus / pamong |
| Berita | `/berita` | Berita & pengumuman padukuhan |
| Layanan | `/layanan` | Info layanan administrasi |
| Kontak | `/kontak` | Kontak pengurus |
| Verifikasi | `/verifikasi` | Verifikasi keaslian surat via QR code |
| Privasi | `/privasi` | Kebijakan privasi data warga |

### 🔐 Dashboard Ops *(unlisted — URL tidak dipublikasikan)*

| Modul | URL | Role minimum | Deskripsi |
|-------|-----|-------------|-----------|
| Dashboard | `/ops` | padukuhan | Ringkasan data + statistik |
| Data Jiwa | `/ops/warga` | padukuhan | CRUD lengkap penduduk |
| Kartu Keluarga | `/ops/kk` | padukuhan | Manajemen KK + 360° view |
| Mutasi | `/ops/mutasi` | padukuhan | Lahir · meninggal · pindah masuk/keluar |
| Pencarian | `/ops/cari` | padukuhan | Pencarian global warga & KK |
| Surat | `/ops/surat` | admin | Buat surat + generate PDF + arsip |
| Laporan | `/ops/laporan` | admin | Rekap periode + export CSV/PDF |
| Import | `/ops/import` | admin | Import massal CSV/Excel + wizard validasi |
| Backup | `/ops/backup` | superadmin | Snapshot & restore spreadsheet |
| Peta | `/ops/peta` | padukuhan | Peta sebaran warga per RT |
| Portal | `/ops/portal` | admin | Kelola konten halaman publik |
| Data Master | `/ops/master` | admin | RT, jabatan, jenis mutasi, dll |
| Audit Log | `/ops/log` | admin | Semua aksi + IP + timestamp |
| Akun | `/ops/akun` | superadmin | Manajemen akun pengurus |

### 👥 Sistem Multi-Role

| Role | Deskripsi | Akses |
|------|-----------|-------|
| `superadmin` | Pengelola utama sistem | Full — termasuk manajemen akun & backup |
| `admin` | Pengurus padukuhan | Semua fitur ops kecuali akun & backup |
| `padukuhan` | Petugas lapangan | Read-only + input mutasi & warga |

---

## 🔄 Alur Kerja

### Input data warga baru

```
Pengurus login /ops/warga
        │
        ▼ POST /api/warga
   Validasi NIK + duplikat check
        │
        ▼ sheets.ts → Google Sheets (tab Warga)
   Tulis ke Sheets
        │
        ├──▶ Audit log ditulis (tab Log) — IP + user + timestamp
        │
        └──▶ /api/stats cache invalidated → /statistik updated
```

### Alur surat keterangan

```
/ops/surat → isi form
        │
        ▼ POST /api/surat
   Generate hash unik surat
        │
        ├──▶ Simpan arsip → tab Surat (Sheets)
        │
        ▼ GET /api/print?id=xxx
   HTML template → PDF (server-side)
        │
        └──▶ QR code berisi /verifikasi?id=xxx
                    │
                    ▼ warga scan
             GET /api/verify?id=xxx
             → tampil data surat (tanpa NIK)
```

### Alur import massal

```
Upload CSV / XLSX
        │
        ▼ POST /api/import/preview
   Parse + validasi (NIK, format, duplikat)
        │
        ▼ Tampil preview + error summary
   Konfirmasi pengurus
        │
        ▼ POST /api/bulk
   Batch write → Sheets (dengan rate limiting)
        │
        └──▶ Laporan hasil import (berhasil/gagal per baris)
```

### Alur autentikasi

```
POST /api/auth/login
   │
   ├── Rate limit check (max 12 attempt / 10 menit / IP)
   ├── Lookup akun di tab Akun (Sheets)
   ├── bcrypt.compare(password, hash)
   └── Set JWT httpOnly cookie (8 jam)
           │
           ▼
      Redirect → /ops
      Middleware server-side cek cookie setiap request
```

---

## ⚙️ Setup & Instalasi

### Prasyarat

- Node.js `≥ 18`
- pnpm `9.x` — `npm install -g pnpm`
- Akun Google Cloud (untuk Sheets API)

### 1. Clone & install

```bash
git clone https://github.com/haviq/jetis-sumur-web.git
cd jetis-sumur-web
pnpm install
```

### 2. Buat file `.env`

```env
# ── Auth ──────────────────────────────────────
AUTH_SECRET=isi-random-string-panjang-minimal-32-karakter

# ── Google Sheets (database) ──────────────────
SHEETS_SPREADSHEET_ID=id-spreadsheet-anda
GOOGLE_SERVICE_ACCOUNT_EMAIL=nama@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi...\n-----END PRIVATE KEY-----\n"

# ── Site ──────────────────────────────────────
NUXT_PUBLIC_SITE_URL=https://domain-anda.vercel.app
NUXT_PUBLIC_TENANT_ID=jetis-sumur
```

> **Tip:** Salin `.env.example` sebagai titik awal.

### 3. Setup Google Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau gunakan yang ada
3. Aktifkan **Google Sheets API** di *APIs & Services → Library*
4. Buat **Service Account** di *IAM & Admin → Service Accounts*
5. Buat key JSON → download
6. Salin `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
7. Salin `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
8. **Share spreadsheet** ke email service account dengan role **Editor**

### 4. Inisialisasi sistem

```bash
# Jalankan dev server
pnpm dev

# Cek koneksi Sheets
curl http://localhost:3000/api/health
# → {"ok":true,"mode":"sheets","tenantId":"jetis-sumur"}

# Setup awal: buat tab Sheets + akun superadmin
curl -X POST http://localhost:3000/api/onboard
```

### 5. Build & deploy

```bash
# Build production
pnpm build

# Preview lokal
pnpm preview
```

**Deploy ke Vercel:**
1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan semua env vars di *Settings → Environment Variables*
4. Deploy otomatis setiap push ke `main`

---

## 🗄️ Skema Database (Google Sheets)

| Tab | Kolom utama | Keterangan |
|-----|-------------|------------|
| `Warga` | NIK · nama · tgl_lahir · jenis_kelamin · RT · status · noKK | Data jiwa/penduduk |
| `KK` | noKK · kepalaKeluarga · alamat · RT · jumlahJiwa | Kartu Keluarga |
| `Mutasi` | tgl · jenis · NIK · nama · keterangan · operator | Log perubahan warga |
| `Berita` | id · judul · tanggal · konten · penulis · status | Berita padukuhan |
| `Akun` | username · password_hash · role · nama · aktif | Akun pengurus |
| `Log` | tgl · user · aksi · target · detail · ip | Audit trail semua aksi |
| `Surat` | id · jenis · nama · NIK · tgl · hash · status | Arsip surat keterangan |
| `Master` | jenis · kode · nilai | RT, jabatan, jenis mutasi |
| `Portal` | id · jenis · judul · konten · status | Konten halaman publik |
| `Branding` | key · value | Nama, alamat, tagline, dll |

> **NIK tidak pernah diekspos** ke halaman publik — hanya tersedia di server-side handler dan dashboard terautentikasi.

---

## 🔌 API Reference

### Publik *(tanpa autentikasi)*

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/health` | Health check — `{ok, mode, tenantId}` |
| `GET` | `/api/stats` | Statistik kependudukan publik |
| `GET` | `/api/berita` | Daftar berita padukuhan |
| `GET` | `/api/tenant` | Info site & branding |
| `GET` | `/api/verify?id=` | Verifikasi keaslian surat |
| `POST` | `/api/auth/login` | Login pengurus |
| `POST` | `/api/auth/logout` | Logout + hapus cookie |
| `GET` | `/api/auth/session` | Cek sesi aktif |

### Terproteksi *(perlu cookie sesi)*

| Method | Endpoint | Role min. | Deskripsi |
|--------|----------|-----------|-----------|
| `GET/POST` | `/api/warga` | padukuhan | CRUD penduduk |
| `GET/POST` | `/api/keluarga` | padukuhan | CRUD Kartu Keluarga |
| `GET/POST` | `/api/mutasi` | padukuhan | Mutasi warga |
| `GET` | `/api/search` | padukuhan | Pencarian global |
| `GET` | `/api/kk360` | admin | Profil KK 360° |
| `GET` | `/api/map` | padukuhan | Data peta per RT |
| `GET/POST` | `/api/surat` | admin | Surat keterangan |
| `GET` | `/api/print` | admin | Generate PDF |
| `GET` | `/api/export` | admin | Export CSV |
| `GET` | `/api/logs` | admin | Audit log |
| `GET/POST` | `/api/master` | admin | Data master |
| `GET/POST` | `/api/portal` | admin | Konten publik |
| `POST` | `/api/import` | admin | Import wizard |
| `POST` | `/api/bulk` | admin | Batch write |
| `POST` | `/api/wa` | admin | WA notifikasi |
| `POST` | `/api/validate/nik` | padukuhan | Validasi NIK |
| `GET/POST` | `/api/backup` | superadmin | Backup/restore |
| `GET/POST` | `/api/akun` | superadmin | Manajemen akun |

---

## 🔒 Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Password** | Disimpan sebagai bcrypt hash — tidak pernah plaintext |
| **Session** | JWT `httpOnly` cookie, tidak bisa diakses JavaScript |
| **Rate limiting** | Max 12 login attempt / 10 menit / IP |
| **URL ops** | `/ops` unlisted — tidak di nav publik, tidak di sitemap |
| **Data publik** | NIK, HP, alamat lengkap tidak pernah di response publik |
| **Audit trail** | Semua CRUD dicatat: user + aksi + target + IP + timestamp |
| **SA key** | Hanya di environment server Vercel, tidak pernah ke client |
| **CORS** | Strict origin matching via Nitro |

---

## 🎨 Design System

```
Design language: dark + emerald
Accent:  #3f9d6c  (emerald green)
Surface: #0f1a14  → #1a2820
Border:  rgba(63, 157, 108, 0.18)
```

| Elemen | Detail |
|--------|--------|
| **Preloader** | Dual-curtain sinematik — wave reveal per huruf, 2 panel exit ke atas |
| **Typewriter** | `PADUKUHAN JETIS SUMUR` — stagger 45ms, fade+slide+blur per karakter |
| **Atmosfer** | Film grain noise + soft bloom orbs + canvas floating particles |
| **Page transition** | Slide out-in + route curtain wipe per navigasi |
| **Cards** | Hover lift + border accent + shadow bloom |
| **Dark/Light** | Toggle tersimpan localStorage |
| **PWA** | Manifest + icon — installable di HP |
| **Font** | Source Serif 4 (display) + Source Sans 3 (body) |

---

## 📦 Dependencies

### Runtime

```json
{
  "nuxt": "^3.17.5",
  "vue": "^3.5.17",
  "vue-router": "^4.5.1",
  "pinia": "^3.0.3",
  "@pinia/nuxt": "^0.11.2"
}
```

### Dev

```json
{
  "@nuxtjs/tailwindcss": "^6.14.0",
  "typescript": "^5.9.2"
}
```

### External Services

| Service | Keperluan | Biaya |
|---------|-----------|-------|
| Google Sheets API v4 | Database utama | Gratis (quota cukup) |
| Google Service Account | Auth server-side | Gratis |
| Google Fonts | Source Serif 4 + Source Sans 3 | Gratis |
| Vercel | Hosting + SSR functions | Gratis (Hobby) |

---

## 🗺 Roadmap

- [x] Multi-role auth (superadmin / admin / padukuhan)
- [x] CRUD warga & KK
- [x] Mutasi penduduk
- [x] Statistik publik + grafik
- [x] Surat keterangan + PDF + QR verifikasi
- [x] Import massal CSV/Excel
- [x] Audit log
- [x] Backup & restore
- [x] Cinematic preloader + page transitions
- [x] PWA manifest
- [x] Multi-tenant foundation
- [ ] WhatsApp notifikasi pengurus (via WA Business API)
- [ ] Peta interaktif sebaran warga (Leaflet)
- [ ] Dashboard RT — akses terbatas per RT
- [ ] Agenda & pengumuman terjadwal
- [ ] Export laporan ke Word/Excel
- [ ] Mobile app (PWA install + offline)
- [ ] Notifikasi push (web push API)
- [ ] Multi-padukuhan / white-label

---

## 📋 Changelog

### v2.0.0 — 2026
- 🎨 Redesign UI: dark+emerald cinematic, dual-curtain preloader
- 🔐 Multi-role auth dengan JWT httpOnly + rate limiting
- 📊 Homepage redesign: stats card, age bands, RT chart
- 🔄 Route curtain per-tab navigation
- ✨ Wave reveal per karakter (stagger, bukan ketikan)
- 📄 PDF surat keterangan + QR verifikasi
- 📥 Import wizard CSV/Excel dengan validasi
- 💾 Backup & restore snapshot Sheets
- 🗺 Peta sebaran warga
- 📡 Audit log lengkap

### v1.0.0
- MVP: CRUD warga & KK
- Login sederhana
- Statistik dasar
- Google Sheets sebagai database

---

## 🤝 Kontribusi

Proyek ini bersifat privat untuk kebutuhan Padukuhan Jetis Sumur.

Jika kamu ingin mengadaptasi sistem ini untuk padukuhan/desa lain:

1. Fork repo ini
2. Ganti `NUXT_PUBLIC_TENANT_ID` dan konfigurasi di `composables/useSite.ts`
3. Sesuaikan nama, logo, dan warna di `assets/css/main.css`
4. Setup spreadsheet baru + service account
5. Deploy ke Vercel

---

## 📄 Lisensi

© 2026 Padukuhan Jetis Sumur — Semua hak dilindungi.

Source code ini dibuat khusus untuk Padukuhan Jetis Sumur, Sleman, DI Yogyakarta.
Tidak untuk didistribusikan ulang tanpa izin tertulis dari pengembang.

---

<div align="center">

Dibuat dengan ❤️ untuk warga Padukuhan Jetis Sumur

**[Nuxt 3](https://nuxt.com)** · **[Vue 3](https://vuejs.org)** · **[Vercel](https://vercel.com)** · **[Google Sheets](https://sheets.google.com)**

</div>
