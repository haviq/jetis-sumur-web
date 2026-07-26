export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const id = q.id ? String(q.id) : undefined
  if (id) {
    const items = listKeluarga()
    const kk = items.find((k) => k.id === id) || null
    if (!kk) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return { ok: true, kk, warga: listWarga({ nomorKk: kk.nomorKk }) }
  }
  const scope = scopeRts(user)
  let rt = q.rt ? String(q.rt) : undefined
  if (scope?.length) {
    const sc = new Set(scope)
    if (rt && !sc.has(String(rt).trim().padStart(2, '0'))) rt = scope[0]
  }
  let items = listKeluarga({
    q: q.q ? String(q.q) : undefined,
    rt,
    scope,
  })
  return { ok: true, items, rtScope: scope || null }
})
