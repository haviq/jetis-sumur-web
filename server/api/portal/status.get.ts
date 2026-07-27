export default defineEventHandler(async (event) => {
  await ensureHydrated()

  const q = getQuery(event)
  const id = typeof q.id === 'string' ? q.id.trim() : ''

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id diperlukan' })
  }

  // Cari dari store — tanpa auth (publik)
  const all = listPortal()
  const item = all.find((p) => p.id === id)

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Pengajuan tidak ditemukan' })
  }

  // Hanya kembalikan field non-sensitif (tanpa NIK, nama, noHp, detail, keperluan)
  return {
    ok: true,
    item: {
      id: item.id,
      jenis: item.jenis,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
  }
})
