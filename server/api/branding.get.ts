export default defineEventHandler(async (event) => {
  // Public tenant branding / white-label payload
  const host = getRequestHeader(event, 'host')
  const q = getQuery(event)
  const tenant = resolveTenant({
    host,
    tenantId: typeof q.tenant === 'string' ? q.tenant : undefined,
    querySlug: typeof q.slug === 'string' ? q.slug : undefined,
  })
  return {
    ok: true,
    tenant: publicTenantView(tenant),
    tenants: listTenants(),
  }
})
