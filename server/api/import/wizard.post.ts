export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<{
    type?: string
    csv?: string
    rows?: Record<string, string>[]
    dryRun?: boolean
  }>(event)

  const type = String(body?.type || 'warga')
  let rows = body?.rows
  if ((!rows || !rows.length) && body?.csv) rows = parseCsvText(body.csv)
  if (!rows?.length) throw createError({ statusCode: 400, statusMessage: 'empty_csv' })

  // Preview / dry-run: validate without writing
  if (body?.dryRun) {
    const preview: { line: number; ok: boolean; message: string; row: Record<string, string> }[] = []
    rows.slice(0, 200).forEach((r, i) => {
      const line = i + 2
      if (type === 'kk' || type === 'keluarga') {
        const nomorKk = (r.nomor_kk || r.nomorkk || r.nomorKk || r.kk || '').trim()
        const kepala = (r.kepala_keluarga || r.kepala || r.nama || '').trim()
        if (!isNomorKk(nomorKk)) preview.push({ line, ok: false, message: 'No. KK invalid', row: r })
        else if (kepala.length < 3) preview.push({ line, ok: false, message: 'Kepala kosong', row: r })
        else preview.push({ line, ok: true, message: 'OK', row: r })
      } else {
        const nik = (r.nik || r.NIK || '').trim()
        const nama = (r.nama || r.Nama || '').trim()
        const nomorKk = (r.nomor_kk || r.nomorkk || r.nomorKk || r.kk || '').trim()
        const v = validateNik(nik)
        if (!v.ok) preview.push({ line, ok: false, message: v.errors.join('; '), row: r })
        else if (nama.length < 2) preview.push({ line, ok: false, message: 'Nama kosong', row: r })
        else if (!isNomorKk(nomorKk)) preview.push({ line, ok: false, message: 'No. KK invalid', row: r })
        else preview.push({ line, ok: true, message: v.warnings.join('; ') || 'OK', row: r })
      }
    })
    const errors = preview.filter((p) => !p.ok)
    return {
      ok: true,
      dryRun: true,
      total: rows.length,
      previewCount: preview.length,
      errorCount: errors.length,
      preview: preview.slice(0, 50),
      errors: errors.slice(0, 30),
    }
  }

  if (type === 'kk' || type === 'keluarga') {
    const result = await importKeluargaRows(rows, user)
    return { ok: true, type: 'kk', ...result }
  }
  const result = await importWargaRows(rows, user)
  return { ok: true, type: 'warga', ...result }
})
