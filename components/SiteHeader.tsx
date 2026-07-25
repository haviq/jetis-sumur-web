'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import site from '@/content/site.json'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/pendataan', label: 'Cara pakai' },
  { href: '/ajukan', label: 'Lapor data' },
  { href: '/privasi', label: 'Privasi' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith('/ops')) return null

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setOpen(false)}>
          <span className="brand-mark">JS</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold truncate">{site.productName}</span>
            <span className="block text-xs truncate" style={{ color: 'var(--muted2)' }}>
              {site.shortName}
            </span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Navigasi utama">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname?.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} data-active={active ? 'true' : 'false'}>
                {l.label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div className="mobile-nav" data-open={open ? 'true' : 'false'}>
        {links.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname?.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              data-active={active ? 'true' : 'false'}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
