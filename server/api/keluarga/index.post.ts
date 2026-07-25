export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const action = String(body?.action || 'upsert')
  if (action === 'delete') {
    const ok = await deleteKeluarga(String(body.id || ''), user)
    return { ok }
  }
  const nomorKk = String(body.nomorKk || '').trim()
  const kepalaKeluarga = String(body.kepalaKeluarga || '').trim()
  const alamat = String(body.alamat || '').trim()
  if (!isNomorKk(nomorKk) || kepalaKeluarga.length < 3 || alamat.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const item = await upsertKeluarga(
    {
      id: body.id ? String(body.id) : undefined,
      nomorKk,
      kepalaKeluarga,
      rt: String(body.rt || '01'),
      rw: String(body.rw || '01'),
      alamat,
      latitude: body.latitude ? String(body.latitude) : undefined,
      longitude: body.longitude ? String(body.longitude) : undefined,
      statusRumah: body.statusRumah ? String(body.statusRumah) : undefined,
    },
    user,
  )
  return { ok: true, item }
})
