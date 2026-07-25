export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'print')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const body = await readBody<{
    jenis?: string
    nik?: string
    keperluan?: string
    nomor?: string
    notes?: string
  }>(event)

  const nik = String(body?.nik || '').trim()
  if (!isNik(nik)) throw createError({ statusCode: 400, statusMessage: 'nik_required' })
  const warga = findWargaByNik(nik)
  if (!warga) throw createError({ statusCode: 404, statusMessage: 'warga_not_found' })

  const arsip = await createSuratArsip(
    {
      jenis: (body?.jenis as any) || 'umum',
      nik,
      nama: warga.nama,
      keperluan: String(body?.keperluan || 'administrasi'),
      nomor: body?.nomor,
      notes: body?.notes,
    },
    user,
  )
  return { ok: true, item: arsip }
})
