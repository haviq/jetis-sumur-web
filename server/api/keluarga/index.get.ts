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
  return {
    ok: true,
    items: listKeluarga({
      q: q.q ? String(q.q) : undefined,
      rt: q.rt ? String(q.rt) : undefined,
    }),
  }
})
