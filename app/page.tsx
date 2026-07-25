import Link from 'next/link'
import { getStats } from '@/lib/db'
import { getSite } from '@/lib/utils'
import { FeatureCard, SectionHeader, StatCard } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const site = getSite()
  const stats = await getStats()
  const maxRt = Math.max(1, ...stats.perRt.map((r) => r.jiwa))

  return (
    <div className="page py-8 md:py-12 space-y-12 md:space-y-16">
      {/* Hero — portal, not SaaS pitch */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <div className="space-y-5">
          <p className="eyebrow">{site.subtitle}</p>
          <h1 className="hero-title text-3xl md:text-4xl lg:text-[2.65rem]">
            Buku data warga, diganti ke web
          </h1>
          <p className="text-[0.98rem] md:text-base max-w-xl leading-relaxed" style={{ color: 'var(--muted)' }}>
            Operator catat KK & jiwa dari HP. Warga bisa lapor koreksi. Cadangan tetap di Google Spreadsheet —
            supaya bisa dibuka di balai tanpa instal aplikasi.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/ajukan" className="btn btn-primary">
              Lapor koreksi data
            </Link>
            <Link href="/pendataan" className="btn btn-ghost">
              Cara pakai
            </Link>
          </div>
          <p className="kicker-row">
            <span>{stats.totalKk} KK aktif</span>
            <span>{stats.totalJiwa} jiwa</span>
            <span>{stats.pendingPengajuan} antrian</span>
            <span>mode {stats.mode}</span>
          </p>
        </div>

        <div className="card p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Ringkasan padukuhan</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted2)' }}>
                Hanya data status aktif
              </p>
            </div>
            <span className="badge badge-ok">aktif</span>
          </div>

          <div className="stat-grid">
            <StatCard label="KK" value={stats.totalKk} />
            <StatCard label="Jiwa" value={stats.totalJiwa} />
            <StatCard label="Laki-laki" value={stats.laki} />
            <StatCard label="Perempuan" value={stats.perempuan} />
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--muted2)' }}>
              <span>Per RT</span>
              <span>jiwa</span>
            </div>
            {stats.perRt.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                Belum ada sebaran RT — isi data di panel operator.
              </p>
            ) : (
              stats.perRt.map((r) => (
                <div key={r.rt} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">RT {r.rt}</span>
                    <span style={{ color: 'var(--muted)' }}>
                      {r.kk} KK · {r.jiwa}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(6, Math.round((r.jiwa / maxRt) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* What it actually does */}
      <section className="space-y-5">
        <SectionHeader
          title="Yang dikerjakan di sini"
          desc="Bukan portal berita. Ini alat kerja harian perangkat."
        />
        <div className="grid md:grid-cols-2 gap-3">
          <FeatureCard
            index={1}
            title="Catat KK & anggota"
            desc="No. KK, NIK, hubungan keluarga, RT, status pindah/meninggal. Satu KK, banyak jiwa."
          />
          <FeatureCard
            index={2}
            title="Cari cepat di lapangan"
            desc="Ketik nama, NIK, atau No. KK. Filter RT kalau lagi rapat dusun."
          />
          <FeatureCard
            index={3}
            title="Antrian dari warga"
            desc="Form publik → pending. Operator yang setujui atau tolak. Tidak auto-masuk data resmi."
          />
          <FeatureCard
            index={4}
            title="Export & spreadsheet"
            desc="Unduh CSV untuk kalurahan. Atau buka Google Sheets yang sama dipakai web."
          />
        </div>
      </section>

      {/* How work flows */}
      <section className="card p-5 md:p-6 space-y-4">
        <SectionHeader title="Alur singkat" desc="Empat langkah, tanpa jargon." />
        <ol className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            ['Warga/RT lapor', 'Isi form koreksi atau datangi balai.'],
            ['Operator cek', 'Cocokkan NIK / KTP / keterangan RT.'],
            ['Data disimpan', 'Masuk web + spreadsheet padukuhan.'],
            ['Laporan keluar', 'Export CSV / print dari Sheets.'],
          ].map(([t, d], i) => (
            <li key={t} className="card-soft p-3.5 flex gap-3">
              <span
                className="w-7 h-7 rounded-md grid place-items-center text-xs font-bold shrink-0"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                {i + 1}
              </span>
              <span>
                <strong className="block mb-0.5">{t}</strong>
                <span style={{ color: 'var(--muted)' }}>{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel-note">
        Panel operator tidak ada di menu. Hanya perangkat yang punya URL & PIN yang bisa masuk. NIK di
        tampilan publik disamarkan.
      </section>

      <section className="flex flex-wrap gap-2.5">
        <Link href="/ajukan" className="btn btn-primary">
          Form warga
        </Link>
        <Link href="/privasi" className="btn btn-ghost">
          Kebijakan data
        </Link>
      </section>
    </div>
  )
}
