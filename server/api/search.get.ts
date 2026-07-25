export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const query = String(q.q || q.query || '').trim()
  const scope = scopeRts(user)
  const result = globalSearch(query, scope, Number(q.limit) || 20)
  return { ok: true, q: query, ...result }
})
