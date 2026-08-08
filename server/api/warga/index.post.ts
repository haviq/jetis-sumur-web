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
      const current = getWargaById(targetId)
      if (current) {
        const kk = getKeluargaByNomor(current.nomorKk)
        if (kk && !scope.includes(kk.rt.padStart(2, '0'))) {
          throw createError({ statusCode: 403, statusMessage: 'forbidden_scope' })
        }
      }
    }
    const ok = await deleteWarga(targetId, user)
    return { ok }
  }

  const nik = String(body.nik || '').trim()
  const nama = String(body.nama || '').trim()
  const nomorKk = String(body.nomorKk || '').trim()

  if (scope?.length) {
    const kk = getKeluargaByNomor(nomorKk)
    if (kk && !scope.includes(kk.rt.padStart(2, '0'))) {
      throw createError({ statusCode: 403, statusMessage: 'forbidden_scope_target_kk' })
    }
    if (body.id) {
      const current = getWargaById(String(body.id))
      if (current) {
        const currentKk = getKeluargaByNomor(current.nomorKk)
        if (currentKk && !scope.includes(currentKk.rt.padStart(2, '0'))) {
          throw createError({ statusCode: 403, statusMessage: 'forbidden_scope_current_warga' })
        }
      }
    }
  }

  if (!isNik(nik) || nama.length < 2 || !nomorKk) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const v = validateNik(nik, {
    tanggalLahir: body.tanggalLahir ? String(body.tanggalLahir) : undefined,
    jk: String(body.jk || 'L') === 'P' ? 'P' : 'L',
  })
  if (!v.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid_nik',
      data: { errors: v.errors, warnings: v.warnings },
    })
  }
  const existing = findWargaByNik(nik)
  if (existing && existing.id !== body.id) {
    throw createError({ statusCode: 409, statusMessage: 'duplicate_nik' })
  }

  const item = await upsertWarga(
    {
      id: body.id ? String(body.id) : undefined,
      nik,
      nomorKk,
      nama,
      tempatLahir: body.tempatLahir ? String(body.tempatLahir) : undefined,
      tanggalLahir: body.tanggalLahir ? String(body.tanggalLahir) : undefined,
      jk: String(body.jk || 'L') === 'P' ? 'P' : 'L',
      agama: body.agama ? String(body.agama) : undefined,
      pendidikan: body.pendidikan ? String(body.pendidikan) : undefined,
      pekerjaan: body.pekerjaan ? String(body.pekerjaan) : undefined,
      statusKawin: body.statusKawin ? String(body.statusKawin) : undefined,
      hubunganKk: (String(body.hubunganKk || 'Lainnya') as any) || 'Lainnya',
      goldar: body.goldar ? String(body.goldar) : undefined,
      bpjs: body.bpjs ? String(body.bpjs) : undefined,
      noHp: body.noHp ? String(body.noHp) : undefined,
      disabilitas: body.disabilitas ? String(body.disabilitas) : undefined,
      foto: body.foto ? String(body.foto) : undefined,
      status: (String(body.status || 'aktif') as any) || 'aktif',
    },
    user,
  )
  return { ok: true, item }
})
