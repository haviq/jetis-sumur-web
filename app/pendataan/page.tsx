import type { Metadata } from 'next'
import Link from 'next/link'
import { getSite } from '@/lib/utils'
import { FeatureCard, SectionHeader } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Cara pakai',
}

const forOps = [
  {
    title: 'Masuk panel (PIN)',
    desc: 'URL panel tidak dipasang di menu publik. Hanya operator yang diberi alamat & PIN.',
  },
  {
    title: 'Input / ubah KK',
    desc: 'Isi No. KK 16 digit, kepala keluarga, alamat, RT. Tambah anggota dengan NIK & hubungan.',
  },
  {
    title: 'Cari & filter',
    desc: 'Cari nama/NIK/No. KK. Filter RT atau status (aktif, pindah, nonaktif).',
  },
  {
    title: 'Review pengajuan',
    desc: 'Tab Pengajuan: setujui atau tolak. Setelah disetujui, operator yang input ke master data.',
  },
  {
    title: 'Lihat demografi',
    desc: 'Ringkas per RT, kelompok usia (kalau tgl lahir terisi), dan status jiwa.',
  },
  {
    title: 'Export / import CSV',
    desc: 'Export flat untuk laporan. Import massal pakai header: no_kk,kepala,rt,nik,nama,jk,hubungan,status.',
  },
]

export default function PendataanPage() {
  const site = getSite()
  return (
    <div className="page py-8 md:py-12 space-y-10">
      <div className="space-y-3 max-w-2xl">
        <p className="eyebrow">Cara pakai</p>
        <h1 className="hero-title text-3xl md:text-4xl">Pendataan di {site.shortName}</h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
          Satu tempat untuk catat KK, cek antrian warga, dan unduh laporan. Cadangan data bisa di
          Google Spreadsheet — familiar untuk perangkat yang sudah biasa Excel.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Untuk perangkat" desc="Urutan kerja yang biasa dipakai di balai." />
        <div className="grid md:grid-cols-2 gap-3">
          {forOps.map((c, i) => (
            <FeatureCard key={c.title} index={i + 1} title={c.title} desc={c.desc} />
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-3">
        <div className="card p-5 space-y-3">
          <h2 className="font-bold">Untuk warga</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Lapor koreksi (alamat, HP, anggota baru, dll). Perubahan tidak langsung masuk — menunggu
            petugas.
          </p>
          <Link href="/ajukan" className="btn btn-primary w-fit">
            Form lapor data
          </Link>
        </div>
        <div className="card p-5 space-y-3">
          <h2 className="font-bold">Yang tidak ada di sini</h2>
          <ul className="text-sm space-y-1.5" style={{ color: 'var(--muted)' }}>
            <li>· Open data publik (NIK / alamat lengkap tidak dibuka)</li>
            <li>· Menu admin di navigasi situs</li>
            <li>· Edit data resmi tanpa verifikasi operator</li>
          </ul>
          <Link href="/privasi" className="btn btn-ghost w-fit">
            Baca privasi
          </Link>
        </div>
      </section>
    </div>
  )
}
