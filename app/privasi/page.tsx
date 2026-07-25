import type { Metadata } from 'next'
import { getSite } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Privasi',
}

export default function PrivasiPage() {
  const site = getSite()
  return (
    <div className="page py-10 md:py-14 max-w-3xl space-y-6">
      <div className="space-y-3">
        <p className="eyebrow">Keamanan data</p>
        <h1 className="hero-title text-3xl md:text-4xl">Privasi & pengelolaan data</h1>
      </div>

      <div className="card p-6 md:p-8 space-y-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        <p>{site.privacyNote}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'NIK lengkap tidak ditampilkan di halaman publik.',
            'Akses operator dilindungi PIN dan sesi terbatas.',
            'Data demo bersifat fiktif; produksi di spreadsheet padukuhan.',
            'Bukan open data — hanya untuk administrasi lokal.',
          ].map((t) => (
            <div key={t} className="card-soft p-4">
              {t}
            </div>
          ))}
        </div>
        <p>
          Untuk koreksi data, gunakan form pengajuan atau hubungi perangkat padukuhan pada jam
          layanan: <strong style={{ color: 'var(--text)' }}>{site.jamLayanan}</strong>.
        </p>
      </div>
    </div>
  )
}
