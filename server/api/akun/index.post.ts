export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'users')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const nama = String(body.nama || '').trim()
  const username = String(body.username || '').trim()
  const role = String(body.role || 'padukuhan') as any
  const status = String(body.status || 'aktif') as any
  const password = String(body.password || '')
  if (!nama || !username) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const row = await upsertAkun({
    id: body.id ? String(body.id) : undefined,
    nama,
    username,
    role,
    status,
    passwordHash: password ? hashPassword(password) : '',
  })
  const { passwordHash: _, ...safe } = row
  return { ok: true, item: safe }
})
