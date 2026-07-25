# Product Requirements Document (PRD)

# Sistem Informasi Pendataan Warga Padukuhan Jetis Sumur

## 1. Ringkasan Produk

Sistem Informasi Pendataan Warga Padukuhan Jetis Sumur adalah aplikasi
berbasis web untuk mengelola data kependudukan secara digital. Sistem
terdiri dari website publik yang menampilkan statistik agregat serta
dashboard pengelola dengan hak akses bertingkat.

------------------------------------------------------------------------

# 2. Tujuan

-   Digitalisasi data penduduk.
-   Mempermudah pendataan dan pembaruan data.
-   Menyediakan statistik real-time.
-   Mempermudah penyusunan laporan.

------------------------------------------------------------------------

# 3. Target Pengguna

-   Masyarakat (Publik)
-   Perangkat Padukuhan
-   Admin
-   Super Admin

------------------------------------------------------------------------

# 4. Role & Hak Akses

## Super Admin

-   Kelola seluruh pengguna
-   CRUD seluruh data
-   Master data
-   Backup & Restore
-   Audit Log
-   Pengaturan sistem
-   Export laporan

## Admin

-   CRUD Data Warga
-   CRUD KK
-   Kelola Mutasi
-   Import & Export
-   Dashboard

## Padukuhan

-   Lihat dashboard
-   Tambah & ubah data
-   Lihat laporan
-   Export laporan

------------------------------------------------------------------------

# 5. Website Publik

Menu: - Beranda - Profil Padukuhan - Struktur Organisasi - Statistik
Penduduk - Berita - Kontak

Dashboard Publik: - Total Penduduk - Total KK - Laki-laki - Perempuan -
Balita - Anak - Remaja - Dewasa - Lansia - Grafik Pendidikan - Grafik
Pekerjaan - Grafik Agama - Grafik Penduduk per RT

Catatan: Data pribadi seperti NIK, nama, alamat, dan nomor HP tidak
ditampilkan.

------------------------------------------------------------------------

# 6. Dashboard Pengelola

## Ringkasan

-   Total Penduduk
-   Total KK
-   Total Laki-laki
-   Total Perempuan
-   Penduduk Masuk
-   Penduduk Keluar
-   Lahir
-   Meninggal

## Grafik

-   Penduduk per RT
-   Penduduk per RW
-   Umur
-   Pendidikan
-   Pekerjaan
-   Agama

## Aktivitas

-   Login terakhir
-   Riwayat perubahan data
-   Data terbaru

------------------------------------------------------------------------

# 7. Modul Sistem

## Dashboard

## Data Kartu Keluarga

Field: - Nomor KK - Kepala Keluarga - RT - RW - Alamat - Latitude -
Longitude

## Data Warga

Field: - NIK - Nama - Nomor KK - Tempat Lahir - Tanggal Lahir - Jenis
Kelamin - Agama - Pendidikan - Pekerjaan - Status Kawin - Hubungan dalam
KK - Golongan Darah - Nomor HP - BPJS - Disabilitas - Foto - Status

## Mutasi

-   Masuk
-   Keluar
-   Lahir
-   Meninggal
-   Pindah Datang
-   Pindah Keluar

## Master Data

-   Agama
-   Pendidikan
-   Pekerjaan
-   RT
-   RW
-   Status Rumah

## Laporan

-   Rekap Penduduk
-   Rekap KK
-   Rekap RT
-   Rekap RW
-   Rekap Pendidikan
-   Rekap Pekerjaan
-   Rekap Agama
-   Rekap Umur
-   Export PDF
-   Export Excel
-   Export CSV

------------------------------------------------------------------------

# 8. Database (Google Spreadsheet)

## akun

  Field
  ---------------
  id
  nama
  username
  password_hash
  role
  status
  last_login

## keluarga

  Field
  -----------------
  id
  nomor_kk
  kepala_keluarga
  rt
  rw
  alamat
  latitude
  longitude

## warga

  Field
  ---------------
  id
  nik
  nomor_kk
  nama
  tempat_lahir
  tanggal_lahir
  jk
  agama
  pendidikan
  pekerjaan
  status_kawin
  hubungan_kk
  goldar
  bpjs
  no_hp
  disabilitas
  foto
  status

## mutasi

  Field
  ------------
  id
  nik
  jenis
  tanggal
  keterangan

## log_aktivitas

  Field
  -----------
  id
  user
  aktivitas
  waktu
  ip

------------------------------------------------------------------------

# 9. Teknologi

Frontend: - Nuxt 3 - Vue 3 - TypeScript - Tailwind CSS - Pinia

Backend: - Nuxt Server API

Database: - Google Spreadsheet

Middleware: - Google Apps Script

Chart: - ApexCharts

Authentication: - JWT + HTTP Only Cookie

Hosting: - Vercel

------------------------------------------------------------------------

# 10. Non Functional Requirement

-   Responsive
-   Mobile First
-   Dark Mode
-   HTTPS
-   RBAC
-   Audit Log
-   Pagination
-   Search
-   Filter
-   Backup Otomatis
-   Validasi Input

------------------------------------------------------------------------

# 11. Roadmap

## Versi 1.0

-   Login
-   Dashboard
-   CRUD KK
-   CRUD Warga
-   Laporan

## Versi 1.1

-   Import Excel
-   Export PDF
-   Statistik

## Versi 1.2

-   QR Code
-   Google Maps
-   PWA
-   Notifikasi
