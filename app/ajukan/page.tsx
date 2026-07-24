import type { Metadata } from 'next'
import AjukanForm from '@/components/AjukanForm'

export const metadata: Metadata = {
  title: 'Ajukan Update Data',
}

export default function AjukanPage() {
  return (
    <div className="page py-10 max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="hero-title text-3xl">Ajukan update data</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Form ini untuk warga. Perubahan tidak langsung masuk database — menunggu verifikasi
          operator.
        </p>
      </div>
      <AjukanForm />
    </div>
  )
}
