import type { Metadata } from 'next'
import Link from 'next/link'
import { getSite } from '@/lib/utils'
import {
  FeatureCard,
  IconCheck,
  IconPhone,
  IconSearch,
  IconSheet,
  IconShield,
  IconUsers,
  SectionHeader,
} from '@/components/ui'

export const metadata: Metadata = {
  title: 'Pendataan',
}

const capabilities = [
  {
    icon: <IconUsers />,
    title: 'Master KK & jiwa',
    desc: 'No. KK 16 digit, kepala keluarga, alamat, RT/RW, status aktif/pindah/nonaktif, plus anggota lengkap.',
  },
  {
    icon: <IconSearch />,
    title: 'Pencarian & filter',
    desc: 'Cari nama, NIK, No. KK, alamat. Filter per RT dan status untuk kerja per dusun.',
  },
  {
    icon: <IconSheet />,
    title: 'Google Sheets sinkron',
    desc: 'Tab kk, warga, pengajuan, meta. Bisa dibuka & diaudit langsung di spreadsheet padukuhan.',
  },
  {
    icon: <IconCheck />,
    title: 'Antrian pengajuan',
    desc: 'Form publik warga → status pending → approve/reject oleh operator dengan catatan.',
  },
  {
    icon: <IconShield />,
    title: 'Keamanan operator',
    desc: 'PIN + sesi cookie, panel unlisted, NIK dimask di UI, rate-limit login.',
  },
  {
    icon: <IconPhone />,
    title: 'Export & import CSV',
    desc: 'Laporan ke kalurahan dan migrasi data massal dengan format header yang jelas.',
  },
]

export default function PendataanPage() {
  const site = getSite()
  return (
    <div className="page py-10 md:py-14 space-y-12">
      <div className="space-y-4 max-w-3xl">
        <p className="eyebrow">Cara kerja</p>
        <h1 className="hero-title text-3xl md:text-5xl">
          Sistem pendataan {site.shortName}
        </h1>
        <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
          Satu alur operasional: warga/RT lapor → operator verifikasi → data tersimpan di web +
          spreadsheet. Dirancang untuk perangkat padukuhan, bukan sekadar landing page.
        </p>
      </div>

      <section className="space-y-5">
        <SectionHeader title="Kemampuan inti" desc="Yang dipakai setiap hari di balai / HP operator." />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {capabilities.map((c) => (
            <FeatureCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      <section className="card p-6 md:p-8 space-y-5">
        <SectionHeader
          eyebrow="Pipeline"
          title="5 langkah operasional"
          desc="SOP ringkas yang bisa ditempel di balai."
        />
        <ol className="space-y-3">
          {[
            'Operator masuk lewat panel internal (URL tidak dipublikasikan di menu).',
            'Input / ubah Kartu Keluarga dan anggota (NIK, hubungan, RT, status).',
            'Pencarian instan by nama, NIK, No. KK, atau RT.',
            'Review antrian pengajuan warga (approve / reject + catatan).',
            'Export CSV untuk laporan ke kalurahan / arsip bulanan.',
          ].map((t, i) => (
            <li key={t} className="card-soft p-4 flex gap-3 text-sm items-start">
              <span
                className="w-8 h-8 rounded-lg grid place-items-center font-bold shrink-0"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {i + 1}
              </span>
              <span className="pt-1" style={{ color: 'var(--muted)' }}>
                {t}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-6 space-y-3">
          <h2 className="font-bold text-lg">Untuk warga</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Ajukan koreksi data (alamat, nomor HP, anggota baru, dll). Perubahan tidak langsung masuk —
            menunggu verifikasi operator.
          </p>
          <Link href="/ajukan" className="btn btn-primary w-fit">
            Form pengajuan
          </Link>
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="font-bold text-lg">Untuk perangkat</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Panel operator terpisah dari website publik. Kelola KK, jiwa, import CSV, dan pantau
            demografi per RT.
          </p>
          <Link href="/privasi" className="btn btn-ghost w-fit">
            Kebijakan privasi
          </Link>
        </div>
      </section>
    </div>
  )
}
