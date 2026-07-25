import type { Metadata } from 'next'
import { getSite } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Privasi',
}

export default function PrivasiPage() {
  const site = getSite()
  return (
    <div className="page py-8 md:py-12 max-w-2xl space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">Data</p>
        <h1 className="hero-title text-3xl md:text-4xl">Privasi</h1>
      </div>

      <div className="card p-5 md:p-6 space-y-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        <p>{site.privacyNote}</p>
        <ul className="space-y-2">
          <li>· NIK penuh tidak ditampilkan di halaman publik.</li>
          <li>· Panel operator dilindungi PIN; URL tidak dipasang di menu.</li>
          <li>· Data demo fiktif; produksi di spreadsheet/padukuhan.</li>
          <li>· Bukan open data — administrasi lokal saja.</li>
        </ul>
        <p>
          Koreksi data: form lapor atau datang ke balai ({site.jamLayanan}).
        </p>
      </div>
    </div>
  )
}
