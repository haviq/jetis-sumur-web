/** White-label site config composable — reads from /api/branding, falls back to env */

export type SiteConfig = {
  tenantId: string
  siteName: string
  siteTagline: string
  siteAlamat: string
  /** RT list, e.g. ['01','02','03','04'] */
  siteRt: string[]
  /** Short logo text, e.g. 'JS' */
  logoText: string
  // extended fields from TenantConfig
  productName: string
  jamLayanan: string
  wilayah: {
    padukuhan: string
    kalurahan?: string
    kapanewon?: string
    kabupaten?: string
    provinsi?: string
  }
  branding?: { primary?: string; accent?: string } | null
}

/** Cached result so multiple callers in the same page don't double-fetch */
let _cached: SiteConfig | null = null

export async function useSiteAsync(): Promise<SiteConfig> {
  if (_cached) return _cached

  try {
    const data = await $fetch<{
      ok: boolean
      tenant: {
        id: string
        name: string
        shortName: string
        productName: string
        tagline: string
        alamat: string
        jamLayanan: string
        wilayah: SiteConfig['wilayah']
        rtList: string[]
        branding?: { primary?: string; accent?: string } | null
      }
      logoText?: string
    }>('/api/branding')

    if (data?.ok && data.tenant) {
      const t = data.tenant
      _cached = {
        tenantId: t.id,
        siteName: t.shortName || t.name,
        siteTagline: t.tagline,
        siteAlamat: t.alamat,
        siteRt: t.rtList ?? [],
        logoText: data.logoText ?? t.shortName?.slice(0, 2).toUpperCase() ?? 'JS',
        productName: t.productName,
        jamLayanan: t.jamLayanan,
        wilayah: t.wilayah,
        branding: t.branding ?? null,
      }
      return _cached
    }
  } catch {
    // fall through to env fallback
  }

  _cached = _envFallback()
  return _cached
}

function _envFallback(): SiteConfig {
  // useRuntimeConfig() only works inside setup; for SSR/server, plain env access is fine
  const cfg = (() => {
    try {
      return useRuntimeConfig()
    } catch {
      return null
    }
  })()
  const tenantId = cfg?.public?.tenantId ?? 'jetis-sumur'
  return {
    tenantId,
    siteName: 'Jetis Sumur',
    siteTagline: 'Pendataan Warga · DI Yogyakarta',
    siteAlamat: 'Sleman, DI Yogyakarta',
    siteRt: ['01', '02', '03', '04'],
    logoText: 'JS',
    productName: 'Data Warga Jetis Sumur',
    jamLayanan: 'Senin–Jumat 08.00–14.00 WIB',
    wilayah: { padukuhan: 'Jetis Sumur', provinsi: 'DI Yogyakarta' },
    branding: { primary: '#0d3b2e', accent: '#34d399' },
  }
}

/**
 * Synchronous composable — returns reactive refs backed by an async fetch.
 * Safe to call in <script setup>; data hydrates after the initial render.
 */
export function useSite() {
  const site = useState<SiteConfig>('site-config', () => _envFallback())

  // kick off fetch on client & server (useAsyncData deduplicates)
  useAsyncData('site-config', async () => {
    const config = await useSiteAsync()
    site.value = config
    return config
  })

  return {
    site,
    tenantId: computed(() => site.value.tenantId),
    siteName: computed(() => site.value.siteName),
    siteTagline: computed(() => site.value.siteTagline),
    siteAlamat: computed(() => site.value.siteAlamat),
    siteRt: computed(() => site.value.siteRt),
    logoText: computed(() => site.value.logoText),
  }
}

export function formatNum(n: number | undefined | null) {
  return new Intl.NumberFormat('id-ID').format(n || 0)
}
