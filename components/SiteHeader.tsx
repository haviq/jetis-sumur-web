'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import site from '@/content/site.json'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/pendataan', label: 'Pendataan' },
  { href: '/ajukan', label: 'Ajukan Update' },
  { href: '/privasi', label: 'Privasi' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Ops is unlisted shell — no public chrome
  if (pathname?.startsWith('/ops')) return null

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <span className="brand-mark">JS</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold tracking-wide truncate">
              {site.productName}
            </span>
            <span className="block text-xs truncate" style={{ color: 'var(--muted)' }}>
              {site.shortName} · pendataan warga
            </span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Navigasi utama">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-active={pathname === l.href ? 'true' : 'false'}>
              {l.label}
            </Link>
          ))}
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
              <path d="M18 6 6 18M6 6l12 12" />
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

      <div className={`nav-mobile ${open ? 'open' : ''}`}>
        <div className="page py-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
