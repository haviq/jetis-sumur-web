export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const nomorKk = String(q.nomorKk || q.kk || '').trim()
  if (!nomorKk) throw createError({ statusCode: 400, statusMessage: 'nomor_kk_required' })
  const data = getKk360(nomorKk)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'kk_not_found' })
  const scope = scopeRts(user)
  if (scope && !scope.includes(data.kk.rt)) {
    throw createError({ statusCode: 403, statusMessage: 'rt_forbidden' })
  }
  return { ok: true, data }
})
