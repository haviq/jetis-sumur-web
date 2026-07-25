export default defineEventHandler(async (event) => {
  await ensureHydrated()
  const body = await readBody<{
    action?: string
    id?: string
    status?: string
    catatanAdmin?: string
    jenis?: string
    nama?: string
    nik?: string
    noHp?: string
    keperluan?: string
    detail?: string
  }>(event)

  // Admin update
  if (body?.action === 'update' || body?.id) {
    const user = sessionFromEvent(event)
    if (!user || !canAccess(user.role, 'write')) {
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    }
    const item = await updatePortal(
      String(body.id),
      {
        status: body.status as any,
        catatanAdmin: body.catatanAdmin,
      },
      user,
    )
    if (!item) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return { ok: true, item }
  }

  // Public create
  const nama = String(body?.nama || '').trim()
  const nik = String(body?.nik || '').trim()
  const keperluan = String(body?.keperluan || '').trim()
  if (nama.length < 3 || !isNik(nik) || keperluan.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const item = await createPortal({
    jenis: body?.jenis === 'update_data' ? 'update_data' : 'surat',
    nama,
    nik,
    noHp: body?.noHp ? String(body.noHp) : undefined,
    keperluan,
    detail: body?.detail ? String(body.detail) : undefined,
  })
  return { ok: true, item: { id: item.id, status: item.status, createdAt: item.createdAt } }
})
