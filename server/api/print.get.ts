export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'print')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()

  const q = getQuery(event)
  const type = String(q.type || 'rekap')
  const host = getRequestHeader(event, 'host')
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
    addLog(user.username, `print_surat ${nik}`)
    return renderSuratHtml({
      tenant,
      jenis: String(q.jenis || 'umum'),
      nomor: typeof q.nomor === 'string' ? q.nomor : undefined,
      warga,
      kk,
      keperluan: typeof q.keperluan === 'string' ? q.keperluan : 'administrasi',
      printedBy: user.nama,
    })
  }

  if (type === 'warga') {
    const rt = typeof q.rt === 'string' ? q.rt : undefined
    const status = typeof q.status === 'string' ? (q.status as any) : undefined
    const rowsRaw = listWarga({ rt, status })
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
      filterNote: [rt ? `RT ${rt}` : null, status ? `status ${status}` : null].filter(Boolean).join(' · ') || 'Semua warga',
    })
  }

  // default rekap agregat
  const stats = await getPublicStats()
  addLog(user.username, 'print_rekap')
  return renderRekapHtml({
    tenant,
    stats,
    printedBy: user.nama,
  })
})
