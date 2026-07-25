export default defineEventHandler(async (event) => {
  await ensureHydrated()
  const user = sessionFromEvent(event)
  const host = getRequestHeader(event, 'host')
  const tenant = resolveTenant({ host, tenantId: user?.tenantId })
  return {
    ok: true,
    mode: dbMode(),
    sheetsConfigured: sheetsConfigured(),
    tenantId: tenant.id,
    admin: Boolean(user),
    user: user
      ? {
          id: user.id,
          nama: user.nama,
          username: user.username,
          role: user.role,
          tenantId: user.tenantId || tenant.id,
        }
      : null,
  }
})
