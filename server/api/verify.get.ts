export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const token = String(q.token || q.t || '').trim()
  if (!token) throw createError({ statusCode: 400, statusMessage: 'token_required' })
  await ensureHydrated()
  const surat = findSuratByToken(token)
  if (!surat || surat.status === 'dibatalkan') {
    throw createError({ statusCode: 404, statusMessage: 'surat_not_found' })
  }
  // Public verify — mask NIK
  return {
    ok: true,
    valid: true,
    surat: {
      nomor: surat.nomor,
      jenis: surat.jenis,
      nama: surat.nama,
      nikMasked: maskNik(surat.nik),
      keperluan: surat.keperluan,
      status: surat.status,
      createdAt: surat.createdAt,
    },
  }
})
