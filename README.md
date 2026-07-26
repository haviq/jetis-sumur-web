# Jetis Sumur — Sistem Informasi Pendataan Warga

> Sistem pendataan warga berbasis web untuk Padukuhan Jetis Sumur, DI Yogyakarta.
> Data KK, jiwa, mutasi, dan statistik — dikelola oleh pengurus, dibaca publik.

**Live →** https://jetis-sumur-web.vercel.app  
**Dashboard →** `/ops` *(unlisted — hanya pengurus yang tahu URL ini)*

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Publik)                   │
│   Nuxt 3 SSR · Vue 3 · Pinia · Tailwind CSS            │
│   Beranda · Statistik · Profil · Berita · Layanan       │
└────────────────────────┬────────────────────────────────┘
                         │ fetch /api/*
┌────────────────────────▼────────────────────────────────┐
│                  SERVER / API (Nitro)                    │
│   H3 route handlers · JWT session cookie                │
│   Auth middleware · Rate limiting · Audit log           │
└────────────────────────┬────────────────────────────────┘
                         │ Google Sheets API v4
┌────────────────────────▼────────────────────────────────┐
│               DATABASE — Google Sheets                  │
│   Spreadsheet ID: env SHEETS_SPREADSHEET_ID             │
│   Service Account OAuth2 (server-only)                  │
│   Tab: Warga · KK · Mutasi · Berita · Akun · Log · Surat│
└─────────────────────────────────────────────────────────┘
```

### Layer ringkasan

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Frontend** | Nuxt 3 + Vue 3 | SSR, file-based routing, `<NuxtLink>` page transition |
| **State** | Pinia | Auth store (`stores/auth.ts`) |
| **Styling** | Tailwind CSS + custom CSS | Dark+emerald theme, CSS custom properties |
| **Backend** | Nitro (H3) | API route handlers, server utils |
| **Auth** | JWT cookie (`httpOnly`) | 8 jam, multi-role: `superadmin / admin / padukuhan` |
| **Database** | Google Sheets API v4 | Spreadsheet sebagai DB — tidak perlu server DB |
| **Deploy** | Vercel (Nitro preset) | SSR functions, edge-ready |

---

## Fitur

### 🌐 Publik (tanpa login)

| Halaman | Deskripsi |
|---------|-----------|
| `/` | Beranda — statistik ringkas, kelompok umur, per RT, berita |
| `/statistik` | Grafik & tabel kependudukan lengkap |
| `/profil` | Profil padukuhan, sejarah, visi-misi |
| `/struktur` | Struktur pengurus / pamong |
| `/berita` | Berita & pengumuman padukuhan |
| `/layanan` | Informasi layanan administrasi |
| `/kontak` | Kontak pengurus |
| `/verifikasi` | Verifikasi keaslian surat *(scan QR)* |
| `/privasi` | Kebijakan privasi data warga |

### 🔐 Ops Dashboard (`/ops` — unlisted)

| Halaman | Deskripsi |
|---------|-----------|
| `/ops` | Dashboard ringkasan |
| `/ops/warga` | CRUD data jiwa (penduduk) |
| `/ops/kk` | Manajemen Kartu Keluarga |
| `/ops/mutasi` | Catat mutasi: lahir, meninggal, pindah masuk/keluar |
| `/ops/cari` | Pencarian global warga / KK |
| `/ops/surat` | Pembuatan & arsip surat keterangan |
| `/ops/laporan` | Rekap laporan per periode + export PDF |
| `/ops/import` | Import data massal via CSV/Excel (wizard) |
| `/ops/backup` | Backup & restore snapshot Sheets |
| `/ops/peta` | Peta sebaran warga per RT |
| `/ops/portal` | Pengumuman & konten portal publik |
| `/ops/master` | Data master (RT, dusun, jabatan, dll) |
| `/ops/log` | Audit log semua aksi pengurus |
| `/ops/akun` | Manajemen akun pengurus (superadmin only) |

### 🔑 Sistem Multi-Role

| Role | Akses |
|------|-------|
| `superadmin` | Full access: semua fitur + manajemen akun |
| `admin` | Semua fitur ops kecuali manajemen akun |
| `padukuhan` | Read-only + input mutasi saja |

---

## Alur Kerja

### Alur data warga baru

```
Pengurus (ops/warga) → POST /api/warga → sheets.ts → Google Sheets
                                       ↓
                                 Audit log ditulis → tab Log
                                       ↓
                            Publik /statistik fetch /api/stats → updated
```

### Alur login

```
POST /api/auth/login
  → cek credentials di tab Akun (Sheets)
  → bcrypt compare password hash
  → set JWT httpOnly cookie (8 jam)
  → redirect ke /ops
```

### Alur surat

```
/ops/surat → isi form → POST /api/surat
           → generate PDF via /api/print (HTML → PDF)
           → simpan arsip di Sheets tab Surat
           → QR verifikasi → /verifikasi?id=xxx
```

### Alur import massal

```
Upload CSV/XLSX → POST /api/import/wizard
               → parse + validate (NIK, format, duplikat)
               → preview konfirmasi
               → POST /api/bulk → batch write ke Sheets
```

---

## Struktur Proyek

```
jetis-sumur-web/
├── pages/
│   ├── index.vue              # Beranda
│   ├── statistik.vue          # Statistik kependudukan
│   ├── profil/                # Profil padukuhan
│   ├── berita/                # Berita & pengumuman
│   ├── layanan.vue            # Layanan
│   ├── kontak.vue             # Kontak
│   ├── verifikasi.vue         # Verifikasi surat (QR)
│   ├── privasi.vue            # Kebijakan privasi
│   └── ops/                   # Dashboard pengelola (unlisted)
│       ├── index.vue          # Dashboard
│       ├── warga.vue          # Data jiwa
│       ├── kk.vue             # Kartu Keluarga
│       ├── mutasi.vue         # Mutasi warga
│       ├── cari.vue           # Pencarian global
│       ├── surat.vue          # Surat keterangan
│       ├── laporan.vue        # Laporan & export
│       ├── import.vue         # Import massal
│       ├── backup.vue         # Backup & restore
│       ├── peta.vue           # Peta sebaran
│       ├── portal.vue         # Konten publik
│       ├── master.vue         # Data master
│       ├── log.vue            # Audit log
│       └── akun.vue           # Manajemen akun
│
├── server/
│   ├── api/
│   │   ├── auth/              # login, logout, session
│   │   ├── warga/             # CRUD penduduk
│   │   ├── keluarga/          # CRUD KK
│   │   ├── mutasi/            # Mutasi warga
│   │   ├── surat/             # Surat keterangan
│   │   ├── akun/              # Manajemen user
│   │   ├── master/            # Data master
│   │   ├── portal/            # Konten portal
│   │   ├── import/            # Import wizard
│   │   ├── stats.get.ts       # Statistik publik
│   │   ├── search.get.ts      # Pencarian global
│   │   ├── export.get.ts      # Export CSV
│   │   ├── print.get.ts       # PDF generator
│   │   ├── backup.get/post.ts # Backup/restore
│   │   ├── kk360.get.ts       # Profil KK lengkap
│   │   ├── map.get.ts         # Data peta
│   │   ├── berita.get.ts      # Berita publik
│   │   ├── logs.get.ts        # Audit log
│   │   ├── verify.get.ts      # Verifikasi surat
│   │   ├── wa.post.ts         # WhatsApp notifikasi
│   │   ├── onboard.post.ts    # Setup awal
│   │   ├── health.get.ts      # Health check
│   │   ├── tenant.get.ts      # Info tenant
│   │   ├── branding.get.ts    # Branding/site config
│   │   └── validate/nik.post  # Validasi NIK
│   └── utils/
│       ├── sheets.ts          # Google Sheets read/write
│       ├── auth.ts            # JWT + session + rate limit
│       ├── db.ts              # Abstraksi DB (Sheets)
│       ├── google-auth.ts     # Service Account OAuth2
│       ├── tenant.ts          # Multi-tenant config
│       ├── types.ts           # Type definitions
│       ├── helpers.ts         # Utility functions
│       ├── print.ts           # PDF/HTML generator
│       ├── import.ts          # CSV/Excel parser
│       ├── validate.ts        # Validasi NIK, data
│       └── seed.ts            # Seed akun awal
│
├── layouts/
│   └── default.vue            # Shell: header, footer, preloader, atmosphere
│
├── stores/
│   └── auth.ts                # Pinia: auth state
│
├── composables/
│   └── useSite.ts             # Site config (nama, alamat, dll)
│
├── assets/css/
│   └── main.css               # Design tokens + semua komponen
│
├── public/
│   ├── icon.svg               # App icon
│   └── manifest.webmanifest   # PWA manifest
│
├── nuxt.config.ts             # Konfigurasi Nuxt
└── .env.example               # Template variabel lingkungan
```

---

## Dependensi & Library

### Runtime dependencies

| Package | Versi | Fungsi |
|---------|-------|--------|
| `nuxt` | ^3.17.5 | Framework SSR utama |
| `vue` | ^3.5.17 | UI framework |
| `vue-router` | ^4.5.1 | Client-side routing |
| `pinia` | ^3.0.3 | State management |
| `@pinia/nuxt` | ^0.11.2 | Integrasi Pinia × Nuxt |

### Dev dependencies

| Package | Versi | Fungsi |
|---------|-------|--------|
| `@nuxtjs/tailwindcss` | ^6.14.0 | Utility CSS |
| `typescript` | ^5.9.2 | Type safety |

### External services (via env)

| Service | Keterangan |
|---------|------------|
| **Google Sheets API v4** | Database utama — read/write spreadsheet |
| **Google Service Account** | Auth server-side ke Sheets (JWT OAuth2) |
| **Vercel** | Hosting + serverless functions (Nitro preset) |

### Fonts (Google Fonts CDN)

| Font | Weight | Digunakan untuk |
|------|--------|----------------|
| Source Sans 3 | 400, 600, 700 | Body text, UI |
| Source Serif 4 | 600, 700 | Heading, display, preloader |

---

## Setup & Konfigurasi

### 1. Clone & install

```bash
git clone https://github.com/haviq/jetis-sumur-web.git
cd jetis-sumur-web
pnpm install
```

### 2. Environment variables

Buat file `.env`:

```env
# Auth
AUTH_SECRET=ganti-dengan-secret-panjang

# Google Sheets (database)
SHEETS_SPREADSHEET_ID=id-spreadsheet-anda
GOOGLE_SERVICE_ACCOUNT_EMAIL=nama@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Site
NUXT_PUBLIC_SITE_URL=https://domain-anda.vercel.app
NUXT_PUBLIC_TENANT_ID=jetis-sumur
```

### 3. Setup Google Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Aktifkan **Google Sheets API**
3. Buat **Service Account** → buat key JSON
4. Salin `client_email` dan `private_key` ke `.env`
5. Share spreadsheet ke email service account (Editor)

### 4. Inisialisasi spreadsheet

Jalankan sekali setelah env terkonfigurasi:

```bash
# Health check — pastikan mode=sheets
curl https://domain-anda.vercel.app/api/health

# Onboard (buat tab + akun superadmin awal)
curl -X POST https://domain-anda.vercel.app/api/onboard
```

### 5. Dev lokal

```bash
pnpm dev
# → http://localhost:3000
```

### 6. Build & deploy

```bash
pnpm build
# Atau push ke GitHub → Vercel auto-deploy
```

---

## Struktur Google Sheets (Database)

| Tab | Kolom utama | Deskripsi |
|-----|-------------|-----------|
| `Warga` | NIK, nama, tgl_lahir, jenis_kelamin, RT, status, noKK | Data jiwa/penduduk |
| `KK` | noKK, kepalaKeluarga, alamat, RT, jumlahJiwa | Kartu Keluarga |
| `Mutasi` | tgl, jenis, NIK, nama, keterangan, operator | Log perubahan warga |
| `Berita` | id, judul, tanggal, konten, penulis, status | Berita padukuhan |
| `Akun` | username, password_hash, role, nama, aktif | Akun pengurus |
| `Log` | tgl, user, aksi, target, detail, ip | Audit trail semua aksi |
| `Surat` | id, jenis, nama, NIK, tgl, hash, status | Arsip surat keterangan |
| `Master` | jenis, kode, nilai | RT, jabatan, jenis mutasi |
| `Portal` | id, jenis, judul, konten, status | Konten halaman publik |
| `Branding` | key, value | Nama, alamat, tagline, dll |

---

## Security

- Password disimpan sebagai **bcrypt hash** (bukan plaintext)
- Session JWT `httpOnly` cookie — tidak bisa diakses JS
- **Rate limiting**: max 12 login attempt / 10 menit / IP
- `/ops` URL **unlisted** — tidak ada link publik, tidak di sitemap
- NIK dan data sensitif **tidak pernah ditampilkan** di halaman publik
- Audit log semua aksi CRUD dengan IP + timestamp
- Service Account key hanya ada di environment Vercel (server-only)

---

## UI & Design System

| Elemen | Keterangan |
|--------|------------|
| **Theme** | Dark + emerald (`#3f9d6c` accent) |
| **Preloader** | Dual-curtain sinematik (haviq.dev pattern) — wave reveal per huruf, 2 panel exit ke atas |
| **Atmosfer** | Film grain noise + bloom orbs + canvas particles |
| **Transisi** | Page slide out-in + route curtain per navigasi |
| **Responsive** | Mobile-first, hamburger menu |
| **Dark/Light** | Toggle tersimpan di localStorage |
| **PWA** | Manifest + icon — bisa di-install di HP |

---

## API Endpoints

### Publik (tanpa auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/stats` | Statistik kependudukan |
| `GET` | `/api/berita` | Daftar berita |
| `GET` | `/api/tenant` | Info site/branding |
| `GET` | `/api/health` | Health check + mode |
| `GET` | `/api/verify` | Verifikasi surat (by ID) |
| `POST` | `/api/auth/login` | Login pengurus |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/session` | Cek sesi aktif |

### Terproteksi (perlu cookie sesi)

| Method | Endpoint | Role minimum |
|--------|----------|-------------|
| `GET/POST` | `/api/warga` | padukuhan |
| `GET/POST` | `/api/keluarga` | padukuhan |
| `GET/POST` | `/api/mutasi` | padukuhan |
| `GET/POST` | `/api/surat` | admin |
| `GET` | `/api/search` | padukuhan |
| `GET` | `/api/export` | admin |
| `GET` | `/api/print` | admin |
| `GET` | `/api/kk360` | admin |
| `GET` | `/api/map` | padukuhan |
| `GET` | `/api/logs` | admin |
| `GET/POST` | `/api/backup` | superadmin |
| `POST` | `/api/import` | admin |
| `POST` | `/api/bulk` | admin |
| `GET/POST` | `/api/master` | admin |
| `GET/POST` | `/api/portal` | admin |
| `GET/POST` | `/api/akun` | superadmin |
| `POST` | `/api/wa` | admin |
| `POST` | `/api/validate/nik` | padukuhan |

---

## Lisensi & Penggunaan

Dibuat untuk **Padukuhan Jetis Sumur**, Sleman, DI Yogyakarta.  
Source code ini adalah milik pengembang — tidak untuk didistribusikan ulang tanpa izin.

---

*Dibangun dengan Nuxt 3 · Deployed on Vercel · Database via Google Sheets*
