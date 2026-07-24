import Link from 'next/link'
import { getSite } from '@/lib/utils'

export default function SiteFooter() {
  const site = getSite()
  return (
    <footer className="mt-16 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="page py-10 grid gap-6 md:grid-cols-3 text-sm">
        <div className="space-y-2">
          <p className="font-bold">{site.productName}</p>
          <p style={{ color: 'var(--muted)' }}>{site.tagline}</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Tautan</p>
          <div className="flex flex-col gap-1" style={{ color: 'var(--muted)' }}>
            <Link href="/pendataan">Cara kerja pendataan</Link>
            <Link href="/ajukan">Ajukan update data</Link>
            <Link href="/privasi">Privasi</Link>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Kontak padukuhan</p>
          <p style={{ color: 'var(--muted)' }}>{site.alamat}</p>
          <p style={{ color: 'var(--muted2)' }}>{site.jamLayanan}</p>
        </div>
      </div>
      <div
        className="page py-4 text-xs border-t"
        style={{ borderColor: 'var(--border)', color: 'var(--muted2)' }}
      >
        © {new Date().getFullYear()} {site.name}. Dibangun sebagai sistem operasional desa.
      </div>
    </footer>
  )
}
