export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  if (q.admin === '1') {
    const user = sessionFromEvent(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    return { ok: true, stats: await getAdminStats(), user }
  }
  return { ok: true, stats: await getPublicStats() }
})
