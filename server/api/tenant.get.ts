export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host')
  const q = getQuery(event)
  const tenant = resolveTenant({
    host,
    querySlug: typeof q.tenant === 'string' ? q.tenant : null,
  })
  return {
    ok: true,
    tenant: publicTenantView(tenant),
    tenants: listTenants(),
  }
})
