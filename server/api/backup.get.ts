export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const action = String(q.action || 'export')

  if (action === 'export' || getMethod(event) === 'GET') {
    addLog(user.username, 'backup_export')
    const bundle = exportBackupBundle()
    setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="jetis-backup-${new Date().toISOString().slice(0, 10)}.json"`)
    return bundle
  }

  return { ok: true }
})
