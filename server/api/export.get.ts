export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const type = String(q.type || 'warga')
  const scope = scopeRts(user)

  let targetRt = q.rt ? String(q.rt).trim().padStart(2, '0') : undefined
  if (targetRt) {
    if (scope?.length && !scope.includes(targetRt)) {
      throw createError({ statusCode: 403, statusMessage: 'forbidden_scope_rt' })
    }
  }

  // type=excel → forward to the Excel-compatible CSV endpoint (BOM + semicolon)
  if (type === 'excel') {
    const subType = q.subtype ? String(q.subtype) : 'warga'
    return sendRedirect(event, `/api/export-excel?type=${subType}${targetRt ? `&rt=${targetRt}` : ''}`, 302)
  }

  if (type === 'kk') {
    const rows = listKeluarga({ scope, rt: targetRt })
    const csv = toCsv(
      ['id', 'nomor_kk', 'kepala', 'rt', 'rw', 'alamat', 'status_rumah'],
      rows.map((r) => [r.id, r.nomorKk, r.kepalaKeluarga, r.rt, r.rw, r.alamat, r.statusRumah || '']),
    )
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="rekap-kk.csv"')
    return csv
  }

  if (type === 'mutasi') {
    const rows = listMutasi()
    const csv = toCsv(
      ['id', 'nik', 'nama', 'jenis', 'tanggal', 'keterangan'],
      rows.map((r) => [r.id, r.nik, r.nama || '', r.jenis, r.tanggal, r.keterangan || '']),
    )
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="rekap-mutasi.csv"')
    return csv
  }

  if (type === 'rekap') {
    const s = await getPublicStats()
    const lines: (string | number)[][] = [
      ['metrik', 'nilai'],
      ['total_penduduk', s.totalPenduduk],
      ['total_kk', s.totalKk],
      ['laki', s.laki],
      ['perempuan', s.perempuan],
      ['balita', s.balita],
      ['anak', s.anak],
      ['remaja', s.remaja],
      ['dewasa', s.dewasa],
      ['lansia', s.lansia],
      ...s.perRt.map((r) => [`rt_${r.rt}_jiwa`, r.jiwa]),
      ...s.agama.map((a) => [`agama_${a.label}`, a.count]),
    ]
    const csv = toCsv(lines[0] as string[], lines.slice(1) as (string | number)[][])
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="rekap-penduduk.csv"')
    return csv
  }

  const kkMap = new Map(listKeluarga({ scope, rt: targetRt }).map((k) => [k.nomorKk, k]))
  const rows = listWarga({ scope, rt: targetRt })
  const csv = toCsv(
    [
      'nik',
      'nama',
      'nomor_kk',
      'kepala',
      'rt',
      'rw',
      'jk',
      'tanggal_lahir',
      'agama',
      'pendidikan',
      'pekerjaan',
      'hubungan_kk',
      'status',
    ],
    rows.map((w) => {
      const k = kkMap.get(w.nomorKk)
      return [
        w.nik,
        w.nama,
        w.nomorKk,
        k?.kepalaKeluarga || '',
        k?.rt || '',
        k?.rw || '',
        w.jk,
        w.tanggalLahir || '',
        w.agama || '',
        w.pendidikan || '',
        w.pekerjaan || '',
        w.hubunganKk,
        w.status,
      ]
    }),
  )
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="rekap-warga.csv"')
  return csv
})
