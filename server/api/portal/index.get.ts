export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  await ensureHydrated()

  if (getMethod(event) === 'GET') {
    if (!user || !canAccess(user.role, 'read')) {
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    }
    const q = getQuery(event)
    const items = listPortal({
      status: typeof q.status === 'string' ? (q.status as any) : undefined,
    })
    return { ok: true, items }
  }

  return { ok: false }
})
