'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import site from '@/content/site.json'

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/ops')) return null

  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="page py-12 grid gap-8 md:grid-cols-3 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="brand-mark">JS</span>
            <div>
              <p className="font-bold">{site.productName}</p>
              <p className="text-xs" style={{ color: 'var(--muted2)' }}>
                Sistem operasional padukuhan
              </p>
            </div>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>
            {site.tagline}
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-semibold">Tautan</p>
          <div className="flex flex-col gap-2" style={{ color: 'var(--muted)' }}>
            <Link href="/pendataan" className="hover:opacity-90">
              Cara kerja pendataan
            </Link>
            <Link href="/ajukan" className="hover:opacity-90">
              Ajukan update data
            </Link>
            <Link href="/privasi" className="hover:opacity-90">
              Privasi & data
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-semibold">Kontak padukuhan</p>
          <p style={{ color: 'var(--muted)' }}>{site.alamat}</p>
          <p style={{ color: 'var(--muted2)' }}>{site.jamLayanan}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted2)' }}>
            Data warga bersifat internal. Bukan open data publik.
          </p>
        </div>
      </div>

      <div
        className="page py-4 text-xs border-t flex flex-wrap gap-2 justify-between"
        style={{ borderColor: 'var(--border)', color: 'var(--muted2)' }}
      >
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>Mobile-first · spreadsheet-ready · siap audit</span>
      </div>
    </footer>
  )
}
