export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()

  const q = getQuery(event)
  const status = typeof q.status === 'string' ? (q.status as any) : undefined
  const items = listAgenda(status)

  return { ok: true, items }
})
