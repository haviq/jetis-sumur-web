export default defineEventHandler(async (event) => {
  await ensureHydrated()
  const q = getQuery(event)
  const all = q.all === '1'
  if (all) {
    const user = sessionFromEvent(event)
    if (!user || !canAccess(user.role, 'read')) {
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    }
  }
  return { ok: true, items: listBerita(all) }
})
