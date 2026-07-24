# PRD — Sistem Pendataan Warga Padukuhan Jetis Sumur

**Product Requirements Document**  
**Versi:** 1.0 · **Tanggal:** 25 Juli 2026  
**Produk:** `jetis-sumur-web`  
**Tipe:** Web app operasional (bukan sekadar profil desa)  
**Database V1:** Google Sheets (gratis, non-developer friendly)  
**Target ship:** GitHub public + README premium + deploy Vercel  

---

## 1. Executive Summary

Membangun **portal pendataan warga digital** untuk **Padukuhan Jetis Sumur** yang:

1. Menyimpan data keluarga & anggota di **Google Spreadsheet** (DB + backup + audit trail natural).
2. Memberi **dashboard admin** (PIN) untuk CRUD, filter, pencarian, export.
3. Memberi **form publik opsional** (self-report / update data) dengan verifikasi admin.
4. Bisa dipamerkan & dijual sebagai **produk desa digital** (README + demo + SOP).

**Nilai jual:** perangkat desa tidak perlu belajar database; cukup buka Google Sheet. Developer tidak bayar Postgres di V1. Data tetap portable (CSV/XLSX).

---

## 2. Latar Belakang & Masalah

| Masalah hari ini | Dampak |
|------------------|--------|
| Data warga di kertas / Excel lokal | Hilang, tidak sinkron antar perangkat |
| Sulit cari KK / NIK / RT cepat | Pelayanan lambat |
| Tidak ada rekap demografi real-time | Laporan ke kalurahan manual |
| Ganti HP / laptop = data tercecer | Risiko tinggi |
| Belum ada akses remote aman | Perlu datang ke balai |

**Peluang:** Google Sheets sudah familiar di perangkat desa. Web app = antarmuka rapi + validasi + role, Sheets = storage.

---

## 3. Tujuan & Sasaran (OKR-ish)

### Tujuan produk
Digitalisasi pendataan KK & warga Jetis Sumur dengan cost ≈ 0 (Sheets + Vercel free/hobby).

### Sasaran terukur V1

| Metrik | Target |
|--------|--------|
| Waktu cari warga by NIK/nama | < 5 detik |
| Input 1 KK lengkap | < 3 menit di HP |
| Export CSV | 1 klik |
| Uptime demo | ≥ 99% (Vercel) |
| Admin non-IT bisa pakai | 1 sesi training 30 menit |

---

## 4. Target Pengguna

| Persona | Peran | Kebutuhan |
|---------|-------|-----------|
| **Dukuh / perangkat** | Admin | CRUD KK, rekap RT, export |
| **Kadus / RT** | Operator terbatas (V1.1) | Lihat & update RT sendiri |
| **Warga** | Self-service opsional | Ajukan update data (antrian) |
| **KKN / developer** | Maintainer | Deploy, env, README, SOP |

---

## 5. Ruang Lingkup

### 5.1 In Scope — V1 (MVP shippable)

**Publik**
- Landing page profil singkat Padukuhan Jetis Sumur (branding premium).
- Halaman “Layanan Pendataan” (cara kerja, privasi, kontak).
- Form **Pengajuan Update Data** (opsional, status pending).

**Admin (URL unlisted, PIN)**
- Login PIN (env `ADMIN_PIN`).
- Dashboard statistik: total KK, jiwa, L/P, per RT.
- Daftar KK + search (nama KK, NIK, No. KK, alamat, RT).
- Detail KK + daftar anggota.
- CRUD KK & anggota.
- Filter RT, status (aktif/pindah/meninggal).
- Export CSV (KK + anggota flatten).
- Sinkron baca/tulis ke Google Sheets.

**Infra**
- Next.js App Router + TypeScript.
- Google Sheets API (service account).
- Deploy Vercel.
- GitHub repo + **README premium**.
- `PRD.md`, `DESIGN.md`, `SOP-ADMIN.md`.

### 5.2 Out of Scope V1 (explicit)

- Login multi-user OAuth / role RT terpisah.
- Upload foto KTP (privasi + storage cost).
- Integrasi Dukcapil resmi.
- SMS/WA blast massal.
- Offline PWA full sync.
- GIS peta tumpang batas (bisa V1.1).
- Pembayaran / iuran.

### 5.3 V1.1+ (backlog)

- Role per-RT (hanya data RT-nya).
- Import bulk dari Excel lama.
- Kartu keluarga print PDF.
- Grafik demografi (usia, pekerjaan, pendidikan).
- Audit log sheet terpisah.
- Form survei dinamis (Sheets columns).

---

## 6. Model Data (Google Sheets)

### Spreadsheet: `Jetis Sumur — Pendataan Warga`

#### Sheet `kk` (satu baris = 1 Kartu Keluarga)

| Kolom | Tipe | Wajib | Catatan |
|-------|------|-------|---------|
| `id` | string | ✓ | UUID / `KK-0001` |
| `no_kk` | string(16) | ✓ | unik |
| `kepala_keluarga` | string | ✓ | |
| `nik_kk` | string(16) | ✓ | NIK kepala |
| `rt` | string | ✓ | `01`–`0N` |
| `rw` | string | | default `01` |
| `alamat` | string | ✓ | |
| `dusun` | string | | Jetis Sumur |
| `status` | enum | ✓ | `aktif` \| `pindah` \| `nonaktif` |
| `telepon` | string | | |
| `catatan` | string | | |
| `created_at` | ISO | ✓ | |
| `updated_at` | ISO | ✓ | |

#### Sheet `warga` (satu baris = 1 jiwa)

| Kolom | Tipe | Wajib | Catatan |
|-------|------|-------|---------|
| `id` | string | ✓ | |
| `kk_id` | string | ✓ | FK → kk.id |
| `nik` | string(16) | ✓ | unik soft |
| `nama` | string | ✓ | |
| `jk` | enum | ✓ | `L` \| `P` |
| `tempat_lahir` | string | | |
| `tgl_lahir` | date | | `YYYY-MM-DD` |
| `hubungan` | enum | ✓ | Kepala / Istri / Anak / … |
| `agama` | string | | |
| `pendidikan` | string | | |
| `pekerjaan` | string | | |
| `status_kawin` | string | | |
| `status` | enum | ✓ | `aktif` \| `pindah` \| `meninggal` |
| `updated_at` | ISO | ✓ | |

#### Sheet `pengajuan` (form publik)

| Kolom | Catatan |
|-------|---------|
| `id`, `jenis` (baru/update), `payload_json`, `nama_pelapor`, `telepon`, `status` (pending/approved/rejected), `created_at`, `reviewed_at`, `admin_note` |

#### Sheet `meta`

| key | value |
|-----|-------|
| `padukuhan` | Jetis Sumur |
| `last_sync` | ISO |
| `schema_version` | 1 |

---

## 7. Persyaratan Fungsional

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-01 | Landing page branding Jetis Sumur | P0 |
| FR-02 | Admin login PIN + cookie session 12 jam | P0 |
| FR-03 | List KK + search + filter RT/status | P0 |
| FR-04 | Detail KK + anggota | P0 |
| FR-05 | Create / update / soft-delete KK | P0 |
| FR-06 | Create / update / soft-delete warga | P0 |
| FR-07 | Dashboard statistik (KK, jiwa, L/P, per RT) | P0 |
| FR-08 | Export CSV | P0 |
| FR-09 | Read/write Google Sheets via service account | P0 |
| FR-10 | Validasi NIK 16 digit & No. KK 16 digit | P0 |
| FR-11 | Form pengajuan publik → sheet `pengajuan` | P1 |
| FR-12 | Admin approve/reject pengajuan → merge ke `kk`/`warga` | P1 |
| FR-13 | Mobile-first admin UI | P0 |
| FR-14 | Halaman privasi / disclaimer data pribadi | P1 |
| FR-15 | Seed data demo (bukan data real) untuk README | P0 |

---

## 8. Persyaratan Non-Fungsional

| Area | Target |
|------|--------|
| Perf | Dashboard admin TTI < 3s (4G) |
| Security | Admin unlisted; PIN env; no public NIK full di HTML statis; HTTPS only |
| Privacy | Mask NIK di list publik; full NIK hanya admin |
| Reliability | Sheets rate limit handled (retry/backoff) |
| Maintainability | TypeScript strict; satu `lib/sheets.ts` abstraction |
| Cost | Vercel free + Google free tier |
| A11y | Form label, focus, contrast dark theme |

---

## 9. Arsitektur

```
Browser
  ├─ /                Landing (SSG/ISR)
  ├─ /pendataan       Info + CTA form
  ├─ /ajukan          Form publik → API
  └─ /ops             Admin (client) → /api/*

Next.js (Vercel)
  /api/auth/*         PIN session cookie
  /api/kk/*           CRUD KK
  /api/warga/*        CRUD warga
  /api/stats          Aggregates
  /api/export         CSV
  /api/pengajuan/*    Public + admin review

Google Sheets API
  Service Account JSON (env base64 / multi-line secret)
  Spreadsheet ID (env)
```

**Kenapa Sheets, bukan Postgres V1**
- Perangkat desa bisa audit data langsung di spreadsheet.
- Zero cost, backup = File → Make a copy.
- Cukup untuk ratusan–beberapa ribu baris (padukuhan scale).
- Migrasi ke Supabase/Postgres nanti: abstraksi `lib/db/*` sudah disiapkan.

---

## 10. Tech Stack

| Layer | Pilihan |
|-------|---------|
| Framework | Next.js 15+ App Router, TypeScript |
| UI | Tailwind + dark theme (bukan gold Plosorejo — **teal/emerald desa sawah** atau **indigo ops**) |
| Auth admin | PIN + httpOnly cookie HMAC |
| DB | Google Sheets API v4 (`googleapis`) |
| Deploy | Vercel |
| Repo | GitHub `haviq/jetis-sumur-web` (atau nama final) |
| Docs | PRD.md, DESIGN.md, SOP-ADMIN.md, README premium |

---

## 11. Desain UI (ringkas — detail di DESIGN.md)

**Arah visual:** “Sistem Operasional Desa Premium”
- Background gelap navy/ink, aksen **emerald**
- Font: Inter + instrument heading (bukan Playfair glamor — lebih “product SaaS desa”)
- Admin: tabel padat, sticky search, chip filter RT
- Landing: hero padukuhan + 3 angka (KK / jiwa / RT) dari stats API (cache)

**Admin tidak di navbar publik.**

---

## 12. Keamanan & Privasi

1. URL admin `/ops` (bukan `/admin` generik) — unlisted, no sitemap.
2. `ADMIN_PIN` di Vercel env; min 8 karakter recommended.
3. Service account Google: share spreadsheet **Editor** ke email SA only.
4. Rate limit login & write API.
5. Log tidak menyimpan NIK full ke console production.
6. Halaman `/privasi` menjelaskan data dikelola padukuhan, bukan open data.

---

## 13. Env Variables

```bash
ADMIN_PIN=
SHEETS_SPREADSHEET_ID=
# JSON service account, single-line or base64
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
# optional
NEXT_PUBLIC_SITE_NAME="Padukuhan Jetis Sumur"
NEXT_PUBLIC_SITE_URL=
```

---

## 14. Milestone & Timeline

| Fase | Isi | Estimasi |
|------|-----|----------|
| **M0** | PRD + DESIGN + repo scaffold | 0.5 hari ← **sekarang** |
| **M1** | Sheets schema + lib client + seed demo | 0.5 hari |
| **M2** | Auth PIN + layout admin | 0.5 hari |
| **M3** | CRUD KK/warga + search + stats | 1 hari |
| **M4** | Export CSV + form pengajuan | 0.5 hari |
| **M5** | Landing premium + README + push GitHub | 0.5 hari |
| **M6** | Vercel deploy + SOP training | 0.5 hari |

**Total MVP:** ~3–4 hari fokus terfokus.

---

## 15. Acceptance Criteria (ship V1)

- [ ] Repo di GitHub dengan README premium (screenshot, stack, setup Sheets, env, demo)
- [ ] Landing load di mobile tanpa error
- [ ] Admin login dengan PIN env
- [ ] CRUD KK & warga tersimpan di Google Sheet (verifikasi buka spreadsheet)
- [ ] Search NIK/nama berfungsi
- [ ] Stats dashboard benar vs hitungan sheet
- [ ] Export CSV downloadable
- [ ] Form pengajuan masuk sheet `pengajuan`
- [ ] Tidak ada link admin di nav/footer/sitemap
- [ ] SOP-ADMIN.md untuk perangkat desa

---

## 16. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Sheets quota / latency | Cache stats 30–60s; batch update; backoff |
| Service account key bocor | Env only; rotate key; never commit JSON |
| Data real di repo | Seed **dummy only**; `.gitignore` secrets |
| Admin lupa PIN | Reset via Vercel env + redeploy |
| Kolom sheet diubah manual | Header lock + schema version check |
| Privacy complaint | Masking + privasi page + consent form |

---

## 17. Pricing / Packaging (opsional jual ke desa lain)

| Paket | Isi | Indikasi |
|-------|-----|----------|
| Starter | Deploy + seed + training 1x | 8–15 jt |
| Pro | + import data lama + form warga + 6 bln support | 20–35 jt |
| Multi-padukuhan | 1 codebase N sheet / N spreadsheet | 50 jt+ |

---

## 18. Open Questions (butuh jawaban Hans)

1. **Lokasi adminstratif lengkap?** (Kalurahan / Kapanewon / Kabupaten — untuk branding & alamat).
2. **Berapa RT** di Jetis Sumur?
3. **Sudah ada file Excel warga** yang mau diimpor, atau mulai kosong + demo?
4. **Nama repo GitHub** final? Usulan: `jetis-sumur-web` / `jetis-sumur-pendataan`.
5. **Google account mana** yang pegang spreadsheet (pribadi Hans / email padukuhan)?
6. **Form publik** wajib V1 atau admin-only dulu?

---

## 19. Keputusan Default (jika “gas” tanpa jawab semua)

| Item | Default |
|------|---------|
| Repo | `jetis-sumur-web` |
| Admin path | `/ops` |
| Theme | Dark + emerald |
| RT | 01–04 (konfigurasi) |
| Form publik | Ya (P1, setelah CRUD) |
| Data awal | Seed demo fiktif |
| Sheets | Template di-generate; user tempel credentials |

---

## 20. Deliverables Folder

```
jetis-sumur-web/
  PRD.md                 ← dokumen ini (copy in-repo)
  DESIGN.md
  SOP-ADMIN.md
  README.md              ← premium
  app/
  components/
  lib/sheets.ts
  lib/admin-auth.ts
  content/site.json
  scripts/seed-sheets.mjs
```

---

**Status PRD:** Draft v1.0 — siap direview.  
**Next:** Hans approve / jawab open questions → eksekusi M0–M3.
