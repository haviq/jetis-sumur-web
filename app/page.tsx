import Link from 'next/link'
import { getStats } from '@/lib/db'
import { getSite } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const site = getSite()
  const stats = await getStats()

  return (
    <div className="page py-10 md:py-16 space-y-12">
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--accent)' }}
          >
            {site.subtitle}
          </p>
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl">
            Pendataan warga <span style={{ color: 'var(--accent)' }}>{site.shortName}</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl" style={{ color: 'var(--muted)' }}>
            {site.tagline} Dirancang untuk perangkat padukuhan: cepat di HP, bisa diaudit di Google
            Spreadsheet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pendataan" className="btn btn-primary">
              Pelajari sistem
            </Link>
            <Link href="/ajukan" className="btn btn-ghost">
              Ajukan update data
            </Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted2)' }}>
            Mode data saat ini: <strong style={{ color: 'var(--accent)' }}>{stats.mode}</strong>
            {stats.mode === 'mock' ? ' (demo in-memory — hubungkan Sheets untuk produksi)' : ''}
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
            Snapshot demo
          </p>
          <div className="stat-grid">
            {[
              { label: 'KK aktif', value: stats.totalKk },
              { label: 'Jiwa aktif', value: stats.totalJiwa },
              { label: 'Laki-laki', value: stats.laki },
              { label: 'Perempuan', value: stats.perempuan },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}
              >
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {s.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {stats.perRt.map((r) => (
              <div
                key={r.rt}
                className="flex items-center justify-between text-sm rounded-lg px-3 py-2"
                style={{ background: 'var(--bg2)' }}
              >
                <span>RT {r.rt}</span>
                <span style={{ color: 'var(--muted)' }}>
                  {r.kk} KK · {r.jiwa} jiwa
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            t: 'Spreadsheet sebagai DB',
            d: 'Data bisa dibuka di Google Sheets — backup natural, familiar untuk perangkat desa.',
          },
          {
            t: 'Operator di web',
            d: 'Cari NIK/nama, kelola KK & anggota, export/import CSV. Admin path tidak dipublikasikan.',
          },
          {
            t: 'Siap di-GitHub',
            d: 'README premium, PRD, DESIGN, SOP — cocok untuk portofolio & paket jual ke desa lain.',
          },
        ].map((c) => (
          <article key={c.t} className="card p-5 space-y-2">
            <h2 className="font-bold">{c.t}</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {c.d}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
