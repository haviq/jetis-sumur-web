export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'print')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()

  const q = getQuery(event)
  const type = String(q.type || 'rekap')
  const host = getRequestHeader(event, 'host')
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'https'
  const origin = `${proto}://${host || 'localhost'}`
  const tenant = resolveTenant({
    host,
    tenantId: user.tenantId,
  })

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store')

  if (type === 'surat') {
    const nik = String(q.nik || '').trim()
    if (!isNik(nik)) {
      throw createError({ statusCode: 400, statusMessage: 'nik_required' })
    }
    const warga = findWargaByNik(nik)
    if (!warga) {
      throw createError({ statusCode: 404, statusMessage: 'warga_not_found' })
    }
    const kk = getKeluargaByNomor(warga.nomorKk)
    // archive + QR token
    const arsip = await createSuratArsip(
      {
        jenis: (String(q.jenis || 'umum') as any) || 'umum',
        nik,
        nama: warga.nama,
        keperluan: typeof q.keperluan === 'string' ? q.keperluan : 'administrasi',
        nomor: typeof q.nomor === 'string' ? q.nomor : undefined,
      },
      user,
    )
    const verifyUrl = `${origin}/verifikasi?t=${arsip.verifyToken}`
    addLog(user.username, `print_surat ${nik} ${arsip.nomor}`)
    return renderSuratHtml({
      tenant,
      jenis: arsip.jenis,
      nomor: arsip.nomor,
      warga,
      kk,
      keperluan: arsip.keperluan,
      printedBy: user.nama,
      verifyUrl,
    })
  }

  if (type === 'warga') {
    const rt = typeof q.rt === 'string' ? q.rt : undefined
    const status = typeof q.status === 'string' ? (q.status as any) : undefined
    const scope = scopeRts(user)
    let rowsRaw = listWarga({ rt, status })
    if (scope) {
      const allowed = new Set(
        listKeluarga()
          .filter((k) => scope.includes(k.rt))
          .map((k) => k.nomorKk),
      )
      rowsRaw = rowsRaw.filter((w) => allowed.has(w.nomorKk))
    }
    const kkMap = new Map(listKeluarga().map((k) => [k.nomorKk, k]))
    const rows = rowsRaw.map((w) => {
      const k = kkMap.get(w.nomorKk)
      return {
        nik: w.nik,
        nama: w.nama,
        jk: w.jk,
        rt: k?.rt || '',
        rw: k?.rw || '',
        status: w.status,
        hubungan: w.hubunganKk,
      }
    })
    addLog(user.username, `print_warga n=${rows.length}`)
    return renderWargaListHtml({
      tenant,
      rows,
      printedBy: user.nama,
      filterNote:
        [rt ? `RT ${rt}` : null, status ? `status ${status}` : null].filter(Boolean).join(' · ') ||
        'Semua warga',
    })
  }

  if (type === 'pejabat' || type === 'laporan') {
    const stats = await getPublicStats()
    addLog(user.username, 'print_laporan_pejabat')
    return renderLaporanPejabatHtml({
      tenant,
      stats: {
        ...stats,
        periodLabel: typeof q.period === 'string' ? q.period : 'Periode berjalan',
      },
      printedBy: user.nama,
    })
  }

  const stats = await getPublicStats()
  addLog(user.username, 'print_rekap')
  return renderRekapHtml({
    tenant,
    stats,
    printedBy: user.nama,
  })
})
