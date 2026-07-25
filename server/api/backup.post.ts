export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write') || user.role === 'padukuhan') {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const body = await readBody<{
    mode?: 'merge' | 'replace'
    bundle?: any
  }>(event)
  if (!body?.bundle) throw createError({ statusCode: 400, statusMessage: 'bundle_required' })
  const res = await importBackupBundle(body.bundle, user, body.mode || 'merge')
  return res
})
