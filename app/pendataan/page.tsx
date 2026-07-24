import type { Metadata } from 'next'
import Link from 'next/link'
import { getSite } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pendataan',
}

export default function PendataanPage() {
  const site = getSite()
  return (
    <div className="page py-10 space-y-8 max-w-3xl">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
          Cara kerja
        </p>
        <h1 className="hero-title text-3xl md:text-4xl">Sistem pendataan {site.shortName}</h1>
        <p style={{ color: 'var(--muted)' }}>
          Satu alur: warga / RT lapor → operator verifikasi → data tersimpan (demo memori atau Google
          Sheets produksi).
        </p>
      </div>

      <ol className="space-y-4">
        {[
          'Operator masuk lewat panel internal (URL tidak dipublikasikan di menu).',
          'Input / ubah Kartu Keluarga dan anggota (NIK, hubungan, RT, status).',
          'Pencarian instan by nama, NIK, No. KK, atau RT.',
          'Export CSV untuk laporan ke kalurahan.',
          'Opsional: warga mengajukan update lewat form publik (antrian pending).',
        ].map((t, i) => (
          <li key={t} className="card p-4 flex gap-3 text-sm">
            <span
              className="w-8 h-8 rounded-lg grid place-items-center font-bold shrink-0"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              {i + 1}
            </span>
            <span style={{ color: 'var(--muted)' }}>{t}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Link href="/ajukan" className="btn btn-primary">
          Form pengajuan warga
        </Link>
        <Link href="/privasi" className="btn btn-ghost">
          Kebijakan privasi
        </Link>
      </div>
    </div>
  )
}
