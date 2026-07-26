/** Branding / white-label endpoint — merges tenant registry with env overrides */
export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host')
  const q = getQuery(event)
  const tenant = resolveTenant({
    host,
    tenantId:
      typeof q.tenant === 'string'
        ? q.tenant
        : (process.env.NUXT_PUBLIC_TENANT_ID ?? undefined),
    querySlug: typeof q.slug === 'string' ? q.slug : undefined,
  })

  // Env vars can override per-field for single-tenant deployments
  const siteName = process.env.SITE_NAME || tenant.shortName || tenant.name
  const tagline = process.env.SITE_TAGLINE || tenant.tagline
  const alamat = process.env.SITE_ALAMAT || tenant.alamat
  const rtCount = process.env.SITE_RT_COUNT ? Number(process.env.SITE_RT_COUNT) : undefined
  const logoText =
    process.env.SITE_LOGO_TEXT ||
    (tenant.shortName?.replace(/\s+/g, '').slice(0, 2).toUpperCase() ?? 'JS')

  const base = publicTenantView(tenant)

  return {
    ok: true,
    // top-level convenience fields (env-overrideable)
    siteName,
    tagline,
    alamat,
    rtCount: rtCount ?? base.rtList.length,
    tenantId: tenant.id,
    logoText,
    // full tenant view (preserves rtList, wilayah, branding, etc.)
    tenant: {
      ...base,
      // apply env overrides into the tenant object too so useSite sees them
      name: siteName,
      shortName: siteName,
      tagline,
      alamat,
      ...(rtCount !== undefined
        ? { rtList: Array.from({ length: rtCount }, (_, i) => String(i + 1).padStart(2, '0')) }
        : {}),
    },
    tenants: listTenants(),
  }
})
