import type { Metadata } from 'next'
import { getSite } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Privasi',
}

export default function PrivasiPage() {
  const site = getSite()
  return (
    <div className="page py-10 max-w-3xl space-y-6">
      <h1 className="hero-title text-3xl">Privasi & pengelolaan data</h1>
      <div className="card p-6 space-y-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        <p>{site.privacyNote}</p>
        <p>
          Data demo di repository ini bersifat fiktif. Data produksi disimpan di Google Spreadsheet
          milik padukuhan / operator resmi dan tidak dibuka sebagai open data.
        </p>
        <p>
          NIK lengkap tidak ditampilkan di halaman publik. Akses operator dilindungi PIN dan sesi
          terbatas.
        </p>
        <p>
          Untuk koreksi data, gunakan form pengajuan atau hubungi perangkat padukuhan pada jam
          layanan: {site.jamLayanan}.
        </p>
      </div>
    </div>
  )
}
