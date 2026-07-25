export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  await ensureHydrated()
  const body = await readBody<{
    action?: string
    ids?: string[]
    status?: string
    nomorKk?: string
    rt?: string
    target?: 'warga' | 'kk'
  }>(event)

  const ids = Array.isArray(body?.ids) ? body.ids.map(String) : []
  if (!ids.length) throw createError({ statusCode: 400, statusMessage: 'ids_required' })

  const target = body?.target || 'warga'
  if (target === 'kk' && body?.rt) {
    const res = await bulkUpdateKkRt(ids, String(body.rt), user)
    return { ok: true, ...res }
  }

  const patch: any = {}
  if (body?.status) patch.status = body.status
  if (body?.nomorKk) patch.nomorKk = body.nomorKk
  const res = await bulkUpdateWarga(ids, patch, user)
  return { ok: true, ...res }
})
