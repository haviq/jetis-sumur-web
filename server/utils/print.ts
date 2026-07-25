/**
 * Print-ready HTML (browser → Save as PDF / Cetak).
 * No heavy PDF binary deps on Vercel.
 */

import type { Keluarga, PublicStats, Warga } from './types'
import type { TenantConfig } from './tenant'

function esc(s: string | number | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatIdDate(d = new Date()): string {
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const baseCss = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    font-size: 12pt;
    line-height: 1.45;
    margin: 0;
  }
  .no-print { margin-bottom: 12px; }
  @media print {
    .no-print { display: none !important; }
  }
  .btn {
    display: inline-block;
    padding: 8px 14px;
    background: #1f6b45;
    color: #fff;
    border: 0;
    border-radius: 6px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
  }
  .btn.secondary { background: #444; margin-left: 6px; }
  .kop {
    text-align: center;
    border-bottom: 3px double #111;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .kop h1 { font-size: 14pt; margin: 0; letter-spacing: 0.02em; text-transform: uppercase; }
  .kop h2 { font-size: 16pt; margin: 2px 0 0; text-transform: uppercase; }
  .kop p { margin: 4px 0 0; font-size: 10pt; }
  .title {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
    margin: 18px 0 4px;
    font-size: 13pt;
    text-transform: uppercase;
  }
  .nomor { text-align: center; margin-bottom: 16px; font-size: 11pt; }
  table.data { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-top: 8px; }
  table.data th, table.data td { border: 1px solid #333; padding: 4px 6px; text-align: left; vertical-align: top; }
  table.data th { background: #eee; }
  .meta { font-size: 10.5pt; margin: 8px 0; }
  .ttd {
    margin-top: 28px;
    display: flex;
    justify-content: flex-end;
  }
  .ttd-box { width: 240px; text-align: center; font-size: 11pt; }
  .ttd-space { height: 72px; }
  .para { text-align: justify; margin: 10px 0; }
  .field { margin: 3px 0 3px 24px; }
  .muted { color: #444; font-size: 10pt; }
  ul.stats { columns: 2; font-size: 11pt; }
`

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>${baseCss}</style>
</head>
<body>
  <div class="no-print">
    <button class="btn" type="button" onclick="window.print()">Cetak / Simpan PDF</button>
    <a class="btn secondary" href="javascript:history.back()">Kembali</a>
  </div>
  ${body}
  <script>/* auto-focus print optional */</script>
</body>
</html>`
}

function kopHtml(tenant: TenantConfig): string {
  const w = tenant.wilayah
  return `<div class="kop">
    <h1>Pemerintah ${esc(w.provinsi || 'DI Yogyakarta')}</h1>
    <h1>${esc(w.kabupaten && w.kabupaten !== 'TBA' ? `Kabupaten ${w.kabupaten}` : 'Kabupaten/Kota')}</h1>
    <h1>${esc(w.kapanewon && w.kapanewon !== 'TBA' ? `Kapanewon ${w.kapanewon}` : 'Kapanewon')}</h1>
    <h2>${esc(tenant.name)}</h2>
    <p>${esc(tenant.alamat)}</p>
  </div>`
}

export function renderRekapHtml(opts: {
  tenant: TenantConfig
  stats: PublicStats
  perRt?: { rt: string; jiwa: number; kk: number }[]
  printedBy?: string
}): string {
  const { tenant, stats, printedBy } = opts
  const rows = (stats.perRt || [])
    .map(
      (r) =>
        `<tr><td>RT ${esc(r.rt)}</td><td>${esc(r.kk)}</td><td>${esc(r.jiwa)}</td></tr>`,
    )
    .join('')
  const body = `
  ${kopHtml(tenant)}
  <div class="title">Rekap Data Penduduk</div>
  <div class="nomor">Agregat · ${esc(formatIdDate())}</div>
  <p class="meta">Dicetak oleh: ${esc(printedBy || 'pengelola')} · Mode data: ${esc(stats.mode)}</p>
  <ul class="stats">
    <li>Total penduduk: <strong>${esc(stats.totalPenduduk)}</strong></li>
    <li>Total KK: <strong>${esc(stats.totalKk)}</strong></li>
    <li>Laki-laki: <strong>${esc(stats.laki)}</strong></li>
    <li>Perempuan: <strong>${esc(stats.perempuan)}</strong></li>
    <li>Balita: <strong>${esc(stats.balita)}</strong></li>
    <li>Anak: <strong>${esc(stats.anak)}</strong></li>
    <li>Remaja: <strong>${esc(stats.remaja)}</strong></li>
    <li>Dewasa: <strong>${esc(stats.dewasa)}</strong></li>
    <li>Lansia: <strong>${esc(stats.lansia)}</strong></li>
  </ul>
  <h3 style="font-size:12pt;margin-top:18px">Per RT</h3>
  <table class="data">
    <thead><tr><th>RT</th><th>KK</th><th>Jiwa</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3">Tidak ada data</td></tr>'}</tbody>
  </table>
  <div class="ttd">
    <div class="ttd-box">
      <div>${esc(tenant.shortName)}, ${esc(formatIdDate())}</div>
      <div>Pengelola Data</div>
      <div class="ttd-space"></div>
      <div><strong>( ${esc(printedBy || '........................') } )</strong></div>
    </div>
  </div>
  <p class="muted">Dokumen ini digenerate sistem ${esc(tenant.productName)}. Data pribadi tidak ditampilkan pada rekap publik.</p>
  `
  return shell(`Rekap Penduduk · ${tenant.shortName}`, body)
}

export function renderSuratHtml(opts: {
  tenant: TenantConfig
  jenis: string
  nomor?: string
  warga: Warga
  kk?: Keluarga | null
  keperluan?: string
  printedBy?: string
  verifyUrl?: string
}): string {
  const { tenant, jenis, warga, kk, keperluan, printedBy } = opts
  const nomor =
    opts.nomor ||
    `474/${String(Date.now()).slice(-4)}/PDK/${new Date().getFullYear()}`

  const alamat = kk
    ? `${kk.alamat}, RT ${kk.rt}/RW ${kk.rw}`
    : `RT/RW sesuai data KK ${warga.nomorKk}`

  const jenisLabel: Record<string, string> = {
    domisili: 'Surat Keterangan Domisili',
    usaha: 'Surat Keterangan Usaha',
    tidak_mampu: 'Surat Keterangan Tidak Mampu',
    pengantar: 'Surat Pengantar',
    umum: 'Surat Keterangan',
  }
  const title = jenisLabel[jenis] || jenisLabel.umum

  const body = `
  ${kopHtml(tenant)}
  <div class="title">${esc(title)}</div>
  <div class="nomor">Nomor: ${esc(nomor)}</div>
  <p class="para">
    Yang bertanda tangan di bawah ini, Pengelola ${esc(tenant.name)}, menerangkan bahwa:
  </p>
  <div class="field">Nama&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>${esc(warga.nama)}</strong></div>
  <div class="field">NIK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(warga.nik)}</div>
  <div class="field">Jenis kelamin&nbsp;&nbsp;: ${esc(warga.jk === 'L' ? 'Laki-laki' : 'Perempuan')}</div>
  <div class="field">Tempat/Tgl lahir: ${esc(warga.tempatLahir || '—')}${warga.tanggalLahir ? `, ${esc(warga.tanggalLahir)}` : ''}</div>
  <div class="field">Agama&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(warga.agama || '—')}</div>
  <div class="field">Pekerjaan&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(warga.pekerjaan || '—')}</div>
  <div class="field">Alamat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(alamat)}</div>
  <div class="field">No. KK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(warga.nomorKk)}</div>
  <p class="para">
    Adalah benar warga ${esc(tenant.name)} dan surat ini dibuat untuk keperluan:
    <strong>${esc(keperluan || 'administrasi')}</strong>.
  </p>
  <p class="para">
    Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
  </p>
  <div class="ttd">
    <div class="ttd-box">
      <div>${esc(tenant.shortName)}, ${esc(formatIdDate())}</div>
      <div>Pengelola / Dukuh</div>
      <div class="ttd-space"></div>
      <div><strong>( ${esc(printedBy || '........................') } )</strong></div>
    </div>
  </div>
  ${
    opts.verifyUrl
      ? `<div style="margin-top:16px;text-align:center">
    <img src="${qrImgUrl(opts.verifyUrl, 100)}" width="100" height="100" alt="QR verifikasi" />
    <div class="muted" style="font-size:9pt;margin-top:4px">Scan untuk verifikasi surat<br/>${esc(opts.verifyUrl)}</div>
  </div>`
      : ''
  }
  `
  return shell(`${title} · ${warga.nama}`, body)
}

export function renderWargaListHtml(opts: {
  tenant: TenantConfig
  rows: { nik: string; nama: string; jk: string; rt: string; rw: string; status: string; hubungan: string }[]
  printedBy?: string
  filterNote?: string
}): string {
  const { tenant, rows, printedBy, filterNote } = opts
  const tr = rows
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td><td>${esc(r.nik)}</td><td>${esc(r.nama)}</td><td>${esc(r.jk)}</td><td>${esc(r.rt)}/${esc(r.rw)}</td><td>${esc(r.hubungan)}</td><td>${esc(r.status)}</td></tr>`,
    )
    .join('')
  const body = `
  ${kopHtml(tenant)}
  <div class="title">Daftar Warga</div>
  <div class="nomor">${esc(filterNote || 'Semua data')} · ${esc(formatIdDate())}</div>
  <table class="data">
    <thead>
      <tr><th>No</th><th>NIK</th><th>Nama</th><th>JK</th><th>RT/RW</th><th>Hubungan</th><th>Status</th></tr>
    </thead>
    <tbody>${tr || '<tr><td colspan="7">Kosong</td></tr>'}</tbody>
  </table>
  <div class="ttd">
    <div class="ttd-box">
      <div>${esc(tenant.shortName)}, ${esc(formatIdDate())}</div>
      <div>Pengelola Data</div>
      <div class="ttd-space"></div>
      <div><strong>( ${esc(printedBy || '........................') } )</strong></div>
    </div>
  </div>
  `
  return shell(`Daftar Warga · ${tenant.shortName}`, body)
}

/** Laporan pejabat — rekap bulanan/ringkas untuk dukuh/kalurahan */
export function renderLaporanPejabatHtml(opts: {
  tenant: TenantConfig
  stats: {
    totalKk: number
    totalJiwa: number
    laki: number
    perempuan: number
    masuk: number
    keluar: number
    lahir: number
    meninggal: number
    pindahDatang: number
    pindahKeluar: number
    perRt: { rt: string; kk: number; jiwa: number }[]
    periodLabel?: string
  }
  printedBy?: string
}): string {
  const { tenant, stats, printedBy } = opts
  const rows = (stats.perRt || [])
    .map(
      (r) =>
        `<tr><td>RT ${esc(r.rt)}</td><td class="num">${r.kk}</td><td class="num">${r.jiwa}</td></tr>`,
    )
    .join('')
  const body = `
  ${kopHtml(tenant)}
  <div class="title">Laporan Pejabat · Rekap Penduduk</div>
  <div class="nomor">${esc(stats.periodLabel || 'Periode berjalan')} · ${esc(formatIdDate())}</div>
  <p class="para">
    Dengan hormat, berikut rekap data kependudukan ${esc(tenant.name)} untuk keperluan pejabat/padukuhan.
  </p>
  <table class="data">
    <thead><tr><th>Indikator</th><th class="num">Jumlah</th></tr></thead>
    <tbody>
      <tr><td>Kartu Keluarga</td><td class="num">${stats.totalKk}</td></tr>
      <tr><td>Jiwa (aktif)</td><td class="num">${stats.totalJiwa}</td></tr>
      <tr><td>Laki-laki</td><td class="num">${stats.laki}</td></tr>
      <tr><td>Perempuan</td><td class="num">${stats.perempuan}</td></tr>
      <tr><td>Mutasi masuk</td><td class="num">${stats.masuk}</td></tr>
      <tr><td>Mutasi keluar</td><td class="num">${stats.keluar}</td></tr>
      <tr><td>Lahir</td><td class="num">${stats.lahir}</td></tr>
      <tr><td>Meninggal</td><td class="num">${stats.meninggal}</td></tr>
      <tr><td>Pindah datang</td><td class="num">${stats.pindahDatang}</td></tr>
      <tr><td>Pindah keluar</td><td class="num">${stats.pindahKeluar}</td></tr>
    </tbody>
  </table>
  <div class="title" style="font-size:13pt;margin-top:18px">Per RT</div>
  <table class="data">
    <thead><tr><th>RT</th><th class="num">KK</th><th class="num">Jiwa</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3">—</td></tr>'}</tbody>
  </table>
  <p class="muted">Dokumen internal. Data pribadi individu tidak dilampirkan.</p>
  <div class="ttd">
    <div class="ttd-box">
      <div>${esc(tenant.shortName)}, ${esc(formatIdDate())}</div>
      <div>Pengelola / Dukuh</div>
      <div class="ttd-space"></div>
      <div><strong>( ${esc(printedBy || '........................') } )</strong></div>
    </div>
  </div>
  `
  return shell(`Laporan Pejabat · ${tenant.shortName}`, body)
}

/** Embed simple QR via Google Chart API (print-friendly, no npm dep) */
export function qrImgUrl(data: string, size = 120): string {
  const enc = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}`
}

