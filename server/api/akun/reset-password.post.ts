import { hashPassword, sessionFromEvent, canAccess } from '~/server/utils/auth'
import { upsertAkun, ensureHydrated } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'users')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const body = await readBody<{ id: string; password: string }>(event)
  const id = String(body.id || '').trim()
  const password = String(body.password || '').trim()

  if (!id || !password) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'password_too_short' })
  }

  await ensureHydrated()

  // Ambil data existing dulu biar tidak overwrite field lain
  const { listAkun } = await import('~/server/utils/db')
  const all = await listAkun()
  const existing = (all as any[]).find((a) => a.id === id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'not_found' })
  }

  await upsertAkun({
    id,
    nama: existing.nama,
    username: existing.username,
    role: existing.role,
    status: existing.status,
    rtScope: existing.rtScope,
    passwordHash: hashPassword(password),
  })

  return { ok: true }
})
