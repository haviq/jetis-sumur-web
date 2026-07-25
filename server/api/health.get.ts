export default defineEventHandler(async (event) => {
  await ensureHydrated()
  const user = sessionFromEvent(event)
  return {
    ok: true,
    mode: dbMode(),
    sheetsConfigured: sheetsConfigured(),
    admin: Boolean(user),
    user: user
      ? { id: user.id, nama: user.nama, username: user.username, role: user.role }
      : null,
  }
})
