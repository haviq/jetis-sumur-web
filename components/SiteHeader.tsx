import Link from 'next/link'
import { getSite } from '@/lib/utils'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/pendataan', label: 'Pendataan' },
  { href: '/ajukan', label: 'Ajukan Update' },
  { href: '/privasi', label: 'Privasi' },
]

export default function SiteHeader() {
  const site = getSite()
  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="flex items-center gap-3">
          <span className="brand-mark">JS</span>
          <span>
            <span className="block text-sm font-bold tracking-wide">{site.productName}</span>
            <span className="block text-xs" style={{ color: 'var(--muted)' }}>
              {site.shortName}
            </span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Navigasi utama">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
