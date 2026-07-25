import Link from 'next/link'
import { getStats } from '@/lib/db'
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
  StatCard,
} from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const site = getSite()
  const stats = await getStats()
  const maxRt = Math.max(1, ...stats.perRt.map((r) => r.jiwa))

  return (
    <div className="page py-10 md:py-16 space-y-14 md:space-y-20">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
        <div className="space-y-6">
          <p className="eyebrow">{site.subtitle}</p>
          <h1 className="hero-title text-4xl md:text-5xl lg:text-[3.4rem]">
            Sistem pendataan warga{' '}
            <span style={{ color: 'var(--accent)' }}>{site.shortName}</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl leading-relaxed" style={{ color: 'var(--muted)' }}>
            Kelola KK & jiwa padukuhan dengan rapi: cari cepat, verifikasi pengajuan, export laporan,
            dan simpan di Google Spreadsheet yang familiar untuk perangkat desa.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pendataan" className="btn btn-primary">
              Pelajari sistem
            </Link>
            <Link href="/ajukan" className="btn btn-ghost">
              Ajukan update data
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Mobile-first', 'NIK aman', 'CSV export', 'Sheets-ready'].map((t) => (
              <span key={t} className="badge badge-muted">
                {t}
              </span>
            ))}
            <span className={`badge ${stats.mode === 'sheets' ? 'badge-ok' : 'badge-warn'}`}>
              mode {stats.mode}
            </span>
          </div>
        </div>

        <div className="card p-5 md:p-6 space-y-5 glow-ring">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Snapshot padukuhan</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted2)' }}>
                Data aktif · {site.shortName}
              </p>
            </div>
            <span className="badge badge-sky">live</span>
          </div>

          <div className="stat-grid">
            <StatCard label="KK aktif" value={stats.totalKk} />
            <StatCard label="Jiwa aktif" value={stats.totalJiwa} />
            <StatCard label="Laki-laki" value={stats.laki} />
            <StatCard label="Perempuan" value={stats.perempuan} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
              <span className="font-semibold">Per RT</span>
              <span>{stats.pendingPengajuan} pengajuan pending</span>
            </div>
            {stats.perRt.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                Belum ada sebaran RT.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.perRt.map((r) => (
                  <div key={r.rt} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">RT {r.rt}</span>
                      <span style={{ color: 'var(--muted)' }}>
                        {r.kk} KK · {r.jiwa} jiwa
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.max(8, Math.round((r.jiwa / maxRt) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Mengapa ini"
          title="Pendataan yang dipakai perangkat, bukan cuma website cantik"
          desc="Fokus ke kerja harian: input KK, cek NIK, verifikasi pengajuan, dan laporan yang bisa dibuka di spreadsheet."
        />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FeatureCard
            icon={<IconSheet />}
            title="Spreadsheet sebagai DB"
            desc="Data bisa diaudit di Google Sheets — backup natural, familiar, tanpa ganti kebiasaan perangkat."
          />
          <FeatureCard
            icon={<IconSearch />}
            title="Cari NIK / nama / No. KK"
            desc="Operator menemukan KK dalam hitungan detik. Filter RT & status untuk kerja per dusun."
          />
          <FeatureCard
            icon={<IconUsers />}
            title="KK + anggota lengkap"
            desc="Hubungan keluarga, JK, status pindah/meninggal, dan riwayat update tersusun rapi."
          />
          <FeatureCard
            icon={<IconCheck />}
            title="Antrian pengajuan warga"
            desc="Warga kirim koreksi lewat form publik. Operator approve/reject dari panel internal."
          />
          <FeatureCard
            icon={<IconShield />}
            title="Akses operator terlindungi"
            desc="Panel ops tidak di menu publik. Login PIN + sesi cookie. NIK dimask di tampilan."
          />
          <FeatureCard
            icon={<IconPhone />}
            title="Mobile-first di lapangan"
            desc="Dirancang dipakai di HP saat rapat RT atau layanan di balai — target sentuh ≥ 44px."
          />
        </div>
      </section>

      {/* Workflow */}
      <section className="card p-6 md:p-8 space-y-6">
        <SectionHeader
          eyebrow="Alur kerja"
          title="Dari laporan warga sampai data resmi"
          desc="Satu pipeline sederhana yang bisa dijalankan perangkat padukuhan."
        />
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { n: '01', t: 'Lapor', d: 'Warga / RT kirim update lewat form.' },
            { n: '02', t: 'Verifikasi', d: 'Operator cek NIK & dokumen pendukung.' },
            { n: '03', t: 'Input KK', d: 'Data masuk sistem + spreadsheet.' },
            { n: '04', t: 'Lapor', d: 'Export CSV untuk kalurahan / arsip.' },
          ].map((s) => (
            <div key={s.n} className="card-soft p-4 space-y-2">
              <p className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
                {s.n}
              </p>
              <p className="font-bold">{s.t}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/ajukan" className="btn btn-primary">
            Mulai ajukan update
          </Link>
          <Link href="/pendataan" className="btn btn-ghost">
            Lihat fitur lengkap
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section
        className="rounded-[20px] p-6 md:p-8 border space-y-4"
        style={{
          borderColor: 'color-mix(in srgb, var(--accent) 35%, var(--border))',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 80%, transparent), var(--surface))',
        }}
      >
        <h2 className="section-title text-2xl md:text-3xl">Siap dipakai untuk pendataan resmi</h2>
        <p className="max-w-2xl text-sm md:text-base" style={{ color: 'var(--muted)' }}>
          Cocok untuk padukuhan yang ingin data KK rapi tanpa memaksa perangkat belajar sistem rumit.
          Admin panel hanya untuk operator — tidak ditampilkan di navigasi publik.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/ajukan" className="btn btn-primary">
            Form warga
          </Link>
          <Link href="/privasi" className="btn btn-ghost">
            Kebijakan data
          </Link>
        </div>
      </section>
    </div>
  )
}
