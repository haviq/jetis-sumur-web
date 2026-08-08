/** Multi-tenant foundation — resolve padukuhan/desa by host or TENANT_ID */

export type TenantBranding = {
  primary?: string
  accent?: string
}

export type TenantConfig = {
  id: string
  slug: string
  name: string
  shortName: string
  productName: string
  tagline: string
  alamat: string
  jamLayanan: string
  wilayah: {
    padukuhan: string
    kalurahan?: string
    kapanewon?: string
    kabupaten?: string
    provinsi?: string
  }
  rtList: string[]
  rwDefault: string
  whatsapp?: string
  email?: string
  privacyNote?: string
  sheetsSpreadsheetId?: string
  branding?: TenantBranding
  /** domains that map to this tenant (without protocol) */
  hosts?: string[]
}

const DEFAULT_TENANT: TenantConfig = {
  id: 'jetis-sumur',
  slug: 'jetis-sumur',
  name: 'Padukuhan Jetis Sumur',
  shortName: 'Jetis Sumur',
  productName: 'Data Warga Jetis Sumur',
  tagline: 'Buku data KK & jiwa padukuhan — diweb, di spreadsheet, dipakai perangkat.',
  subtitle: 'Padukuhan Jetis Sumur',
  alamat: 'Padukuhan Jetis Sumur, Glagaharjo, Cangkringan, Sleman, D.I. Yogyakarta 55583',
  wilayah: {
    padukuhan: 'Jetis Sumur',
    kalurahan: 'Glagaharjo',
    kapanewon: 'Cangkringan',
    kabupaten: 'Sleman',
    provinsi: 'DI Yogyakarta',
  },
  rtList: ['01', '02', '03', '04'],
  rwDefault: '01',
  privacyNote:
    'Data warga hanya untuk administrasi padukuhan. Tidak dipublikasikan. Akses operator lewat login pengelola.',
  hosts: ['jetis-sumur-web.vercel.app', 'localhost', '127.0.0.1'],
  whatsapp: '',
  branding: { primary: '#0d3b2e', accent: '#34d399' },
}

/** Registry — extend when onboarding desa baru */
const TENANTS: TenantConfig[] = [
  DEFAULT_TENANT,
  {
    id: 'demo-desa',
    slug: 'demo-desa',
    name: 'Demo Desa Digital',
    shortName: 'Demo Desa',
    productName: 'Data Warga Demo',
    tagline: 'Template multi-tenant untuk white-label padukuhan/desa.',
    alamat: 'Alamat demo — ganti saat onboarding',
    jamLayanan: 'Senin–Jumat 08.00–15.00 WIB',
    wilayah: {
      padukuhan: 'Demo',
      kalurahan: 'Demo',
      kapanewon: 'Demo',
      kabupaten: 'Demo',
      provinsi: 'DI Yogyakarta',
    },
    rtList: ['01', '02'],
    rwDefault: '01',
    hosts: ['demo.localhost'],
  },
]

export function listTenants(): Pick<TenantConfig, 'id' | 'slug' | 'name' | 'shortName'>[] {
  return TENANTS.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    shortName: t.shortName,
  }))
}

export function getTenantById(id: string | undefined | null): TenantConfig {
  if (!id) return DEFAULT_TENANT
  return TENANTS.find((t) => t.id === id || t.slug === id) || DEFAULT_TENANT
}

export function resolveTenant(opts?: {
  host?: string | null
  tenantId?: string | null
  querySlug?: string | null
}): TenantConfig {
  const forced = (opts?.tenantId || process.env.TENANT_ID || process.env.NUXT_PUBLIC_TENANT_ID || '').trim()
  if (forced) return getTenantById(forced)

  const slug = (opts?.querySlug || '').trim()
  if (slug) return getTenantById(slug)

  const host = (opts?.host || '')
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/^www\./, '')
  if (host) {
    const hit = TENANTS.find((t) => (t.hosts || []).some((h) => host === h || host.endsWith(`.${h}`)))
    if (hit) return hit
  }
  return DEFAULT_TENANT
}

export function publicTenantView(t: TenantConfig) {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    shortName: t.shortName,
    productName: t.productName,
    tagline: t.tagline,
    alamat: t.alamat,
    jamLayanan: t.jamLayanan,
    wilayah: t.wilayah,
    rtList: t.rtList,
    rwDefault: t.rwDefault,
    whatsapp: t.whatsapp || '',
    email: t.email || '',
    privacyNote: t.privacyNote || '',
    branding: t.branding || null,
  }
}

export { DEFAULT_TENANT, TENANTS }
