export default defineEventHandler((event) => {
  const siteUrl =
    process.env.NUXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://jetis-sumur-web.vercel.app'

  const pages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/statistik', changefreq: 'weekly', priority: '0.8' },
    { loc: '/layanan', changefreq: 'weekly', priority: '0.8' },
    { loc: '/berita', changefreq: 'weekly', priority: '0.8' },
    { loc: '/struktur', changefreq: 'weekly', priority: '0.7' },
    { loc: '/profil', changefreq: 'weekly', priority: '0.7' },
    { loc: '/kontak', changefreq: 'weekly', priority: '0.7' },
    { loc: '/privasi', changefreq: 'monthly', priority: '0.4' },
    { loc: '/verifikasi', changefreq: 'weekly', priority: '0.6' },
  ]

  const today = new Date().toISOString().slice(0, 10)

  const urlEntries = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${siteUrl}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return xml
})
