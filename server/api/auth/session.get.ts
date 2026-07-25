export default defineEventHandler((event) => {
  const user = sessionFromEvent(event)
  if (!user) return { ok: true, admin: false, user: null }
  return { ok: true, admin: true, user }
})
