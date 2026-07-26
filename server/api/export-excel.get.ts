/**
 * GET /api/export-excel?type=warga|kk|mutasi|rekap
 *
 * Excel-compatible CSV export:
 *  - BOM prefix (\uFEFF) so Excel auto-detects UTF-8
 *  - Semicolon (;) separator so Excel doesn't split on comma in names/addresses
 *  - Content-Disposition: attachment with dated filename
 */

/** Escape a single cell value for semicolon-delimited CSV. */
function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? '')
  // Wrap in quotes if value contains semicolon, double-quote, newline, or leading/trailing space
  if (/[;"'\n\r]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** Build a BOM-prefixed, semicolon-separated CSV string. */
function toCsvExcel(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const BOM = '\uFEFF'
  const lines: string[] = [headers.map(csvCell).join(';')]
  for (const row of rows) {
    lines.push(row.map(csvCell).join(';'))
  }
  return BOM + lines.join('\r\n')
}

/** Format today as YYYY-MM-DD for filenames. */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()
  const q = getQuery(event)
  const type = String(q.type || 'warga')
  const scope = scopeRts(user)
  const date = todayStr()

  // ── Warga ──────────────────────────────────────────────────────────────────
  if (type === 'warga') {
    const kkMap = new Map(listKeluarga({ scope }).map((k) => [k.nomorKk, k]))
    const rows = listWarga({ scope })

    const csv = toCsvExcel(
      [
        'NIK',
        'Nama',
        'Nomor KK',
        'Kepala Keluarga',
        'RT',
        'RW',
        'Alamat',
        'Jenis Kelamin',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Agama',
        'Pendidikan',
        'Pekerjaan',
        'Status Kawin',
        'Hubungan KK',
        'Golongan Darah',
        'BPJS',
        'No HP',
        'Disabilitas',
        'Status',
        'Dibuat',
        'Diperbarui',
      ],
      rows.map((w) => {
        const k = kkMap.get(w.nomorKk)
        return [
          w.nik,
          w.nama,
          w.nomorKk,
          k?.kepalaKeluarga ?? '',
          k?.rt ?? '',
          k?.rw ?? '',
          k?.alamat ?? '',
          w.jk === 'L' ? 'Laki-laki' : 'Perempuan',
          w.tempatLahir ?? '',
          w.tanggalLahir ?? '',
          w.agama ?? '',
          w.pendidikan ?? '',
          w.pekerjaan ?? '',
          w.statusKawin ?? '',
          w.hubunganKk,
          w.goldar ?? '',
          w.bpjs ?? '',
          w.noHp ?? '',
          w.disabilitas ?? '',
          w.status,
          w.createdAt.slice(0, 10),
          w.updatedAt.slice(0, 10),
        ]
      }),
    )

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="rekap-warga-${date}.csv"`)
    addLog(user.username, `export_excel type=warga`)
    return csv
  }

  // ── Kartu Keluarga ─────────────────────────────────────────────────────────
  if (type === 'kk') {
    const rows = listKeluarga({ scope })

    const csv = toCsvExcel(
      [
        'ID',
        'Nomor KK',
        'Kepala Keluarga',
        'RT',
        'RW',
        'Alamat',
        'Status Rumah',
        'Latitude',
        'Longitude',
        'Dibuat',
        'Diperbarui',
      ],
      rows.map((k) => [
        k.id,
        k.nomorKk,
        k.kepalaKeluarga,
        k.rt,
        k.rw,
        k.alamat,
        k.statusRumah ?? '',
        k.latitude ?? '',
        k.longitude ?? '',
        k.createdAt.slice(0, 10),
        k.updatedAt.slice(0, 10),
      ]),
    )

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="rekap-kk-${date}.csv"`)
    addLog(user.username, `export_excel type=kk`)
    return csv
  }

  // ── Mutasi ─────────────────────────────────────────────────────────────────
  if (type === 'mutasi') {
    const rows = listMutasi()

    const csv = toCsvExcel(
      ['ID', 'NIK', 'Nama', 'Jenis Mutasi', 'Tanggal', 'Keterangan', 'Dicatat Oleh', 'Dibuat'],
      rows.map((m) => [
        m.id,
        m.nik,
        m.nama ?? '',
        m.jenis,
        m.tanggal,
        m.keterangan ?? '',
        m.createdBy ?? '',
        m.createdAt.slice(0, 10),
      ]),
    )

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="rekap-mutasi-${date}.csv"`)
    addLog(user.username, `export_excel type=mutasi`)
    return csv
  }

  // ── Rekap agregat ──────────────────────────────────────────────────────────
  if (type === 'rekap') {
    const s = await getPublicStats()

    const rows: (string | number)[][] = [
      ['Total Penduduk Aktif', s.totalPenduduk],
      ['Total KK', s.totalKk],
      ['Laki-laki', s.laki],
      ['Perempuan', s.perempuan],
      ['Balita (0–5)', s.balita],
      ['Anak (6–12)', s.anak],
      ['Remaja (13–17)', s.remaja],
      ['Dewasa (18–59)', s.dewasa],
      ['Lansia (60+)', s.lansia],
      ...s.perRt.map((r) => [`RT ${r.rt} — Jiwa`, r.jiwa]),
      ...s.perRt.map((r) => [`RT ${r.rt} — KK`, r.kk]),
      ...s.perRw.map((r) => [`RW ${r.rw} — Jiwa`, r.jiwa]),
      ...s.agama.map((a) => [`Agama: ${a.label}`, a.count]),
      ...s.pendidikan.map((p) => [`Pendidikan: ${p.label}`, p.count]),
      ...s.pekerjaan.map((p) => [`Pekerjaan: ${p.label}`, p.count]),
    ]

    const csv = toCsvExcel(
      ['Metrik', 'Nilai'],
      rows,
    )

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="rekap-agregat-${date}.csv"`)
    addLog(user.username, `export_excel type=rekap`)
    return csv
  }

  throw createError({ statusCode: 400, statusMessage: 'type tidak valid. Gunakan: warga, kk, mutasi, rekap' })
})
