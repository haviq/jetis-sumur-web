# 📋 Panduan Setup — Sistem Informasi Pendataan Warga Padukuhan

> Dokumen ini untuk pembeli/klien yang ingin menginstall dan mengkonfigurasi sistem di padukuhan/desa mereka.

---

## 📦 Apa yang Kamu Dapat

Sistem pendataan warga digital berbasis web dengan fitur:

| Fitur | Deskripsi |
|---|---|
| **Portal Publik** | Statistik warga, berita, pengumuman — bisa diakses siapa saja |
| **Dashboard Ops** | Kelola KK, jiwa, mutasi, surat, laporan, peta — khusus pengurus |
| **Multi-Role** | 3 level akses: `superadmin`, `admin`, `padukuhan` |
| **Zero Database** | Google Sheets sebagai database — gratis, tidak perlu server |
| **PWA** | Bisa di-install di HP seperti aplikasi native |
| **Backup** | Download lokal + backup ke Google Sheets otomatis |
| **Keamanan** | Session HMAC-SHA256, scrypt password, security headers lengkap |
| **Export** | Export data ke Excel/CSV, cetak laporan, generate surat keterangan |

**Stack:** Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS · Google Sheets API · Vercel

---

## 🔧 Prasyarat

Sebelum mulai, pastikan kamu punya akun:

- [ ] **Google Account** (Gmail biasa, gratis)
- [ ] **GitHub Account** — https://github.com (gratis)
- [ ] **Vercel Account** — https://vercel.com (gratis, daftar pakai GitHub)

---

## 🚀 BAGIAN 1 — Setup Google Sheets (Database)

### Langkah 1.1 — Buat Google Spreadsheet

1. Buka **https://sheets.google.com**
2. Klik **+ Blank spreadsheet**
3. Beri nama: `Data Warga [Nama Padukuhan]`
4. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
   Contoh: `1yx4AmS9ggaaUKwkLWsWAae50M2VOEV6UgvwglVLNs-Q`

5. Buat tab/sheet berikut (klik **+** di bawah):

   | Nama Sheet | Fungsi |
   |---|---|
   | `kk` | Data Kartu Keluarga |
   | `warga` | Data jiwa/anggota KK |
   | `pengajuan` | Pengajuan surat warga |
   | `akun` | Akun pengguna dashboard |
   | `meta` | Konfigurasi sistem |
   | `keluarga` | Relasi keluarga |
   | `mutasi` | Riwayat mutasi warga |
   | `master` | Data master (pekerjaan, dll) |
   | `berita` | Berita & pengumuman |
   | `surat_arsip` | Arsip surat keterangan |
   | `log_aktivitas` | Audit log aktivitas |
   | `portal` | Pengajuan portal warga |
   | `backup` | Backup data otomatis |

### Langkah 1.2 — Buat Google Service Account

1. Buka **https://console.cloud.google.com**
2. Buat project baru → klik dropdown project di atas → **New Project**
   - Nama project: `pendataan-warga` (bebas)
3. Aktifkan Google Sheets API:
   - Kiri: **APIs & Services** → **Library**
   - Cari `Google Sheets API` → klik → **Enable**
4. Buat Service Account:
   - Kiri: **IAM & Admin** → **Service Accounts**
   - Klik **+ Create Service Account**
   - Nama: `pendataan-sa` (bebas)
   - Klik **Create and Continue** → **Done**
5. Download JSON credentials:
   - Klik service account yang baru dibuat
   - Tab **Keys** → **Add Key** → **Create new key** → **JSON**
   - File JSON ter-download otomatis — **simpan aman!**
6. Copy **email service account** dari file JSON (field `client_email`):
   ```
   contoh: pendataan-sa@my-project-123.iam.gserviceaccount.com
   ```

### Langkah 1.3 — Share Spreadsheet ke Service Account

1. Buka Spreadsheet yang dibuat tadi
2. Klik tombol **Share** (kanan atas)
3. Masukkan email service account dari langkah 1.2
4. Role: **Editor**
5. Klik **Send** / **Share**

---

## 🌐 BAGIAN 2 — Deploy ke Vercel

### Langkah 2.1 — Fork Repository

1. Buka link repo yang diberikan penjual
2. Klik **Fork** (kanan atas) → **Create fork**
3. Repository sekarang ada di akun GitHub kamu

### Langkah 2.2 — Import ke Vercel

1. Buka **https://vercel.com** → Login dengan GitHub
2. Klik **Add New** → **Project**
3. Pilih repository hasil fork tadi → klik **Import**
4. **Jangan klik Deploy dulu** — setting environment variables dulu

### Langkah 2.3 — Set Environment Variables

Di halaman setup Vercel, scroll ke bagian **Environment Variables**. Tambahkan satu per satu:

#### 🔴 WAJIB — Tidak bisa jalan tanpa ini

| Variable | Nilai | Keterangan |
|---|---|---|
| `AUTH_SECRET` | string acak min 32 karakter | Kunci enkripsi session. Generate di: https://generate-secret.vercel.app/32 |
| `SHEETS_SPREADSHEET_ID` | ID dari langkah 1.1 | ID spreadsheet Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | email dari file JSON | Email service account |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | private_key dari file JSON | Copy seluruh nilai termasuk `-----BEGIN...-----END-----`. Ganti `\n` dengan enter nyata |

#### 🟡 IDENTITAS PADUKUHAN — Wajib diganti

| Variable | Contoh Nilai | Keterangan |
|---|---|---|
| `SITE_NAME` | `Padukuhan Glagah` | Nama padukuhan/desa |
| `SITE_TAGLINE` | `Pendataan Warga · DI Yogyakarta` | Tagline di header |
| `SITE_ALAMAT` | `Glagah, Temon, Kulon Progo` | Alamat lengkap |
| `SITE_RT_COUNT` | `3` | Jumlah RT |
| `SITE_LOGO_TEXT` | `GL` | 2 huruf untuk logo |
| `NUXT_PUBLIC_SITE_URL` | `https://namadesa.vercel.app` | URL website setelah deploy |
| `NUXT_PUBLIC_TENANT_ID` | `glagah` | ID unik padukuhan (huruf kecil, tanpa spasi) |

#### 🟢 OPSIONAL

| Variable | Keterangan |
|---|---|
| `VAPID_PUBLIC_KEY` | Untuk fitur notifikasi push ke HP. Generate dengan: `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Pasangan dari VAPID_PUBLIC_KEY |
| `ADMIN_PIN` | PIN tambahan untuk super admin (opsional) |

### Langkah 2.4 — Deploy

1. Setelah semua env variables diisi, klik **Deploy**
2. Tunggu 2–3 menit proses build
3. Setelah selesai, klik link preview untuk cek website

---

## 👤 BAGIAN 3 — Setup Akun Pengguna

### Langkah 3.1 — Buka Dashboard Ops

URL dashboard: `https://[domain-kamu].vercel.app/ops`

> ⚠️ URL ini tidak dipublikasikan. Hanya bagikan ke pengurus yang berwenang.

### Langkah 3.2 — Login Pertama Kali

Akun default bawaan sistem:

| Username | Password Default | Role |
|---|---|---|
| `superadmin` | *(diberikan penjual)* | Super Admin — akses penuh |
| `admin` | *(diberikan penjual)* | Admin — semua kecuali manajemen akun |
| `padukuhan` | *(diberikan penjual)* | Perangkat — input data & cetak |

> 🔐 **Segera ganti password** setelah login pertama!

### Langkah 3.3 — Ganti Password

1. Login sebagai `superadmin`
2. Buka `/ops/akun`
3. Klik **Reset PW** di baris akun yang ingin diganti
4. Masukkan password baru (min. 6 karakter)
5. Klik **Reset**

### Langkah 3.4 — Tambah Akun Pengurus

1. Buka `/ops/akun` → klik **+ Akun**
2. Isi formulir:
   - **Nama**: Nama lengkap pengurus
   - **Username**: username untuk login (tanpa spasi)
   - **Password**: password awal
   - **Role**:
     - `padukuhan` — hanya bisa input data dan cetak (untuk Ketua RT/perangkat)
     - `admin` — semua fitur kecuali manajemen akun
     - `super_admin` — akses penuh
   - **RT scope**: Isi nomor RT jika role `padukuhan` dan hanya boleh lihat RT tertentu. Contoh: `01,02`. Kosongkan untuk semua RT.
3. Klik **Simpan**

---

## ⚙️ BAGIAN 4 — Konfigurasi Padukuhan

### Langkah 4.1 — Sesuaikan Identitas di Kode

Edit file `server/utils/tenant.ts` untuk mengubah data padukuhan:

```typescript
const DEFAULT_TENANT = {
  id: 'nama-padukuhan',          // ID unik, huruf kecil, pakai tanda -
  name: 'Padukuhan Nama Desa',   // Nama resmi
  shortName: 'Nama Desa',         // Nama pendek
  tagline: 'Pendataan Warga ...',
  alamat: 'Dusun X, Desa Y, Kecamatan Z',
  jamLayanan: 'Senin–Jumat 08.00–15.00 WIB',
  wilayah: {
    padukuhan: 'Nama Padukuhan',
    kalurahan: 'Nama Kalurahan',
    kapanewon: 'Nama Kapanewon',
    kabupaten: 'Nama Kabupaten',
    provinsi: 'DI Yogyakarta',
  },
  rtList: ['01', '02', '03'],    // Daftar RT yang ada
  rwDefault: '01',
  whatsapp: '6281234567890',     // Nomor WA pengurus (tanpa +)
  branding: {
    primary: '#0d3b2e',          // Warna utama (hex)
    accent: '#34d399',           // Warna aksen (hex)
  },
  hosts: ['namadesa.vercel.app'], // Domain website
}
```

Setelah edit → commit ke GitHub → Vercel otomatis redeploy.

### Langkah 4.2 — Setup Data Master

1. Login ke dashboard → buka `/ops/master`
2. Tambahkan data referensi:
   - Jenis pekerjaan
   - Status perkawinan
   - Jenis surat yang tersedia
   - dll.

---

## 💾 BAGIAN 5 — Backup & Restore

### Backup Lokal
1. Buka `/ops/backup`
2. Klik **⬇ Download backup lokal**
3. File JSON ter-download ke perangkat
4. Simpan di tempat aman (Google Drive, flashdisk)

### Backup ke Google Sheets
1. Buka `/ops/backup`
2. Klik **📊 Backup ke Google Sheets**
3. Data tersimpan otomatis di sheet `backup`
4. Tersimpan max 50 entri (otomatis hapus yang lama)

### Restore Data
1. Buka `/ops/backup`
2. Pilih file backup JSON
3. Pilih mode:
   - **Merge** — gabungkan dengan data yang ada (aman)
   - **Replace** — timpa semua data (hati-hati!)
4. Klik **Pulihkan**

---

## 🗺️ BAGIAN 6 — Fitur Peta (Opsional)

Untuk menampilkan peta dengan titik lokasi KK:

1. Saat input data KK, isi field **Latitude** dan **Longitude**
2. Koordinat bisa didapat dari Google Maps:
   - Buka lokasi di Google Maps
   - Klik kanan → **What's here?**
   - Copy angka koordinat (misal: `-7.795, 110.370`)
3. Peta otomatis muncul di `/ops/peta`

---

## 📱 BAGIAN 7 — Install sebagai Aplikasi HP (PWA)

Website ini bisa di-install di HP seperti aplikasi:

**Android (Chrome):**
1. Buka website di Chrome
2. Tap menu ⋮ → **Add to Home screen**
3. Tap **Install**

**iPhone (Safari):**
1. Buka website di Safari
2. Tap icon Share (kotak + panah atas)
3. Tap **Add to Home Screen**
4. Tap **Add**

---

## 🔔 BAGIAN 8 — Notifikasi Push (Opsional)

Untuk mengaktifkan notifikasi push ke HP pengurus:

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Tambahkan ke Vercel env:
   - `VAPID_PUBLIC_KEY` = publicKey dari output
   - `VAPID_PRIVATE_KEY` = privateKey dari output
3. Redeploy di Vercel
4. Login ke dashboard → `/ops/notifikasi` → aktifkan notifikasi

---

## ❓ TROUBLESHOOTING

### Website tidak bisa dibuka setelah deploy

Cek di Vercel dashboard → tab **Deployments** → klik deployment terbaru → lihat **Build Logs** untuk error.

Penyebab umum:
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` tidak diformat dengan benar → pastikan ada baris `-----BEGIN RSA PRIVATE KEY-----`
- `AUTH_SECRET` terlalu pendek → min 32 karakter

### Login gagal meski password benar

- Pastikan `AUTH_SECRET` di Vercel env sudah diset
- Coba hard refresh (Ctrl+Shift+R)
- Clear cookies browser

### Data tidak tersimpan ke Sheets

- Pastikan service account sudah di-share ke spreadsheet sebagai **Editor**
- Cek `SHEETS_SPREADSHEET_ID` sudah benar
- Pastikan Google Sheets API sudah diaktifkan di Google Cloud Console

### Backup ke Sheets gagal

- Pastikan sheet dengan nama persis `backup` sudah ada di spreadsheet
- Atau biarkan sistem buat otomatis saat pertama kali klik backup

### Halaman `/ops` tidak ditemukan

URL dashboard memang tidak dipublikasikan untuk keamanan. Akses manual: `https://[domain]/ops`

---

## 📞 Kontak & Support

Untuk pertanyaan teknis setelah setup, hubungi:

- **WhatsApp**: *(nomor penjual)*
- **Telegram**: *(username penjual)*

---

## 📝 Catatan Penting

> ⚠️ **Keamanan Data Warga**
> - Data KK dan NIK adalah data pribadi yang dilindungi
> - Jangan share URL `/ops` ke publik
> - Ganti password default segera setelah setup
> - Backup data secara rutin minimal 1x seminggu
> - Simpan file backup di tempat aman

> 💡 **Tips Penggunaan**
> - Gunakan mode **Merge** saat restore untuk keamanan
> - RT scope bisa dibatasi per akun untuk privasi antar-RT
> - Export Excel tersedia di `/ops/laporan` untuk keperluan administrasi

---

*Dokumen ini dibuat untuk versi **2.0.0** — Juli 2026*
