export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  const q = getQuery(event)
  await ensureHydrated()

  // list archive — auth required
  if (getMethod(event) === 'GET' && !q.token) {
    if (!user || !canAccess(user.role, 'read')) {
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    }
    const items = listSurat({
      nik: typeof q.nik === 'string' ? q.nik : undefined,
      status: typeof q.status === 'string' ? (q.status as any) : undefined,
    })
    return { ok: true, items }
  }

  return { ok: true }
})
