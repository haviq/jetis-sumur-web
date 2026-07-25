import type { Metadata } from 'next'
import AjukanForm from '@/components/AjukanForm'

export const metadata: Metadata = {
  title: 'Lapor data',
}

export default function AjukanPage() {
  return (
    <div className="page py-8 md:py-12 max-w-xl space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">Warga</p>
        <h1 className="hero-title text-3xl md:text-4xl">Lapor koreksi data</h1>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
          Isi form ini kalau data KK/jiwa perlu diperbaiki. Petugas yang meninjau — tidak langsung
          berubah di data resmi.
        </p>
      </div>

      <div className="panel-note">
        Siapkan No. KK (16 digit) bila ada. Setelah kirim, simpan kode pengajuan yang muncul.
      </div>

      <AjukanForm />
    </div>
  )
}
