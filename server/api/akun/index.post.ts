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
  const rtScopeRaw = body.rtScope
  const rtScope = Array.isArray(rtScopeRaw)
    ? rtScopeRaw.map(String).map((x) => x.trim()).filter(Boolean)
    : typeof rtScopeRaw === 'string'
      ? String(rtScopeRaw)
          .split(/[|,;]/)
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined
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
    rtScope,
  })
  const { passwordHash: _, ...safe } = row
  return { ok: true, item: safe }
})
