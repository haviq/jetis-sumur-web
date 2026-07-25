export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  // Onboarding checklist — multi-tenant SaaS foundation
  const body = await readBody<{
    id?: string
    name?: string
    shortName?: string
    alamat?: string
    whatsapp?: string
    email?: string
    primary?: string
    accent?: string
    rtList?: string[]
  }>(event)

  // Registry is code-level in V1; return a ready-to-copy config + checklist
  const id = String(body?.id || body?.name || 'desa-baru')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  const draft = {
    id,
    slug: id,
    name: String(body?.name || 'Padukuhan Baru'),
    shortName: String(body?.shortName || body?.name || 'Padukuhan'),
    productName: `Data Warga ${body?.shortName || body?.name || 'Padukuhan'}`,
    tagline: 'Sistem pendataan warga digital — white-label.',
    alamat: String(body?.alamat || ''),
    jamLayanan: 'Senin–Jumat 08.00–14.00 WIB',
    wilayah: {
      padukuhan: String(body?.shortName || body?.name || ''),
      kalurahan: 'TBA',
      kapanewon: 'TBA',
      kabupaten: 'TBA',
      provinsi: 'DI Yogyakarta',
    },
    rtList: body?.rtList?.length ? body.rtList : ['01', '02'],
    rwDefault: '01',
    whatsapp: body?.whatsapp || '',
    email: body?.email || '',
    branding: {
      primary: body?.primary || '#0d3b2e',
      accent: body?.accent || '#34d399',
    },
    hosts: [`${id}.localhost`],
  }

  addLog(user.username, `onboard_draft ${id}`)
  return {
    ok: true,
    draft,
    checklist: [
      'Tambahkan draft ke server/utils/tenant.ts TENANTS[]',
      'Buat Google Sheet baru + share ke service account',
      'Set SHEETS_SPREADSHEET_ID / env tenant',
      'Buat akun superadmin di Ops → Pengguna',
      'Set domain/host di Vercel + branding CSS vars',
      'Uji login + import CSV template',
    ],
  }
})
