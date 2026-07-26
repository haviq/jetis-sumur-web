export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()

  const body = await readBody<{
    action?: string
    id?: string
    judul?: string
    deskripsi?: string
    tanggal?: string
    waktu?: string
    lokasi?: string
    status?: string
  }>(event)

  // Update status existing agenda
  if (body?.action === 'update_status' && body.id) {
    const validStatus = ['aktif', 'selesai', 'batal']
    if (!body.status || !validStatus.includes(body.status)) {
      throw createError({ statusCode: 400, statusMessage: 'invalid_status' })
    }
    const item = await updateAgendaStatus(String(body.id), body.status as any)
    if (!item) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    addLog(user.username, `agenda_status ${item.id} → ${item.status}`)
    return { ok: true, item }
  }

  // Buat agenda baru
  const judul = String(body?.judul || '').trim()
  const tanggal = String(body?.tanggal || '').trim()

  if (judul.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'judul_required' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    throw createError({ statusCode: 400, statusMessage: 'tanggal_invalid' })
  }

  const item = await createAgenda({
    judul,
    deskripsi: body?.deskripsi ? String(body.deskripsi).trim() : undefined,
    tanggal,
    waktu: body?.waktu ? String(body.waktu).trim() : undefined,
    lokasi: body?.lokasi ? String(body.lokasi).trim() : undefined,
    status: body?.status === 'batal' ? 'batal' : body?.status === 'selesai' ? 'selesai' : 'aktif',
    createdBy: user.username,
  })

  addLog(user.username, `agenda_create ${item.id} "${item.judul}"`)

  return { ok: true, id: item.id }
})
