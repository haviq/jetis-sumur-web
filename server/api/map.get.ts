export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const points = mapPoints(scopeRts(user))
  // Fallback centroid points per RT if no coords
  const stats = await getPublicStats()
  const centers: Record<string, [number, number]> = {
    '01': [-7.795, 110.37],
    '02': [-7.796, 110.371],
    '03': [-7.794, 110.369],
    '04': [-7.797, 110.372],
  }
  const fallback = (stats.perRt || []).map((r) => ({
    id: `rt_${r.rt}`,
    nomorKk: '',
    kepala: `RT ${r.rt}`,
    rt: r.rt,
    rw: '01',
    alamat: `Area RT ${r.rt}`,
    lat: centers[r.rt]?.[0] ?? -7.7956,
    lng: centers[r.rt]?.[1] ?? 110.3695,
    jiwa: r.jiwa,
    isCentroid: true,
  }))
  return { ok: true, points: points.length ? points : fallback, hasCoords: points.length > 0 }
})
