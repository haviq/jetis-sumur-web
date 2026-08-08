export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const action = String(body?.action || 'upsert')
  const scope = scopeRts(user)

  if (action === 'delete') {
    const targetId = String(body.id || '')
    if (scope?.length) {
      const current = getKeluargaById(targetId)
      if (current && !scope.includes(current.rt.padStart(2, '0'))) {
        throw createError({ statusCode: 403, statusMessage: 'forbidden_scope' })
      }
    }
    const ok = await deleteKeluarga(targetId, user)
    return { ok }
  }
  const nomorKk = String(body.nomorKk || '').trim()
  const kepalaKeluarga = String(body.kepalaKeluarga || '').trim()
  const alamat = String(body.alamat || '').trim()
  const targetRt = String(body.rt || '01').padStart(2, '0')

  if (scope?.length) {
    if (!scope.includes(targetRt)) {
      throw createError({ statusCode: 403, statusMessage: 'forbidden_scope_target_rt' })
    }
    if (body.id) {
      const current = getKeluargaById(String(body.id))
      if (current && !scope.includes(current.rt.padStart(2, '0'))) {
        throw createError({ statusCode: 403, statusMessage: 'forbidden_scope_current_rt' })
      }
    }
  }

  if (!isNomorKk(nomorKk) || kepalaKeluarga.length < 3 || alamat.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const item = await upsertKeluarga(
    {
      id: body.id ? String(body.id) : undefined,
      nomorKk,
      kepalaKeluarga,
      rt: targetRt,
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
