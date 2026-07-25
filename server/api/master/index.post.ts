export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'master')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<{ items?: any[] }>(event)
  if (!Array.isArray(body?.items)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  await setMaster(body.items, user)
  return { ok: true }
})
