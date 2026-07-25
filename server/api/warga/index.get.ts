export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const q = getQuery(event)
  const scope = scopeRts(user)
  let items = listWarga({
    q: q.q ? String(q.q) : undefined,
    status: q.status ? (String(q.status) as any) : undefined,
    nomorKk: q.nomorKk ? String(q.nomorKk) : undefined,
    rt: q.rt ? String(q.rt) : undefined,
    includeDeleted: q.includeDeleted === '1',
  })
  if (scope) {
    const allowedKk = new Set(
      listKeluarga().filter((k) => scope.includes(k.rt)).map((k) => k.nomorKk),
    )
    items = items.filter((w) => allowedKk.has(w.nomorKk))
  }
  return { ok: true, items, rtScope: scope || null }
})
