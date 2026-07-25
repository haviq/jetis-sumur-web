'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import site from '@/content/site.json'

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/ops')) return null

  return (
    <footer className="mt-16 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="page py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div className="space-y-2">
          <p className="font-bold">{site.name}</p>
          <p style={{ color: 'var(--muted)' }}>{site.tagline}</p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Menu</p>
          <div className="flex flex-col gap-1.5" style={{ color: 'var(--muted)' }}>
            <Link href="/pendataan">Cara pakai</Link>
            <Link href="/ajukan">Lapor data</Link>
            <Link href="/privasi">Privasi</Link>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Balai</p>
          <p style={{ color: 'var(--muted)' }}>{site.alamat}</p>
          <p style={{ color: 'var(--muted2)' }}>{site.jamLayanan}</p>
        </div>
      </div>

      <div
        className="page py-3 text-xs border-t flex flex-wrap gap-2 justify-between"
        style={{ borderColor: 'var(--border)', color: 'var(--muted2)' }}
      >
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>Data internal · bukan open data</span>
      </div>
    </footer>
  )
}
