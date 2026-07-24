import type { MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://jetis-sumur-web.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/pendataan', '/ajukan', '/privasi'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))
}
