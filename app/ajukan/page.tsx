import type { Metadata } from 'next'
import AjukanForm from '@/components/AjukanForm'

export const metadata: Metadata = {
  title: 'Ajukan Update Data',
}

export default function AjukanPage() {
  return (
    <div className="page py-10 md:py-14 max-w-2xl space-y-6">
      <div className="space-y-3">
        <p className="eyebrow">Layanan warga</p>
        <h1 className="hero-title text-3xl md:text-4xl">Ajukan update data</h1>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
          Form ini untuk warga. Perubahan <strong style={{ color: 'var(--text)' }}>tidak langsung</strong>{' '}
          masuk database — menunggu verifikasi operator padukuhan.
        </p>
      </div>

      <div className="card-soft p-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        Siapkan No. KK (16 digit) dan jelaskan data yang ingin diubah. Setelah kirim, simpan kode
        pengajuan yang muncul.
      </div>

      <AjukanForm />
    </div>
  )
}
