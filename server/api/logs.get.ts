export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  return { ok: true, items: listLogs(100) }
})
