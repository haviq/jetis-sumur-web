'use client'

import { useCallback, useEffect, useState } from 'react'
import type { KK, Stats, Pengajuan } from '@/lib/types'
import { maskNik } from '@/lib/utils'

export default function OpsDashboard() {
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [rt, setRt] = useState('')
  const [items, setItems] = useState<KK[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([])
  const [tab, setTab] = useState<'kk' | 'pengajuan' | 'tambah'>('kk')
  const [busy, setBusy] = useState(false)

  // form tambah KK
  const [form, setForm] = useState({
    noKk: '',
    kepalaKeluarga: '',
    nikKk: '',
    rt: '01',
    alamat: 'Jetis Sumur RT 01',
    telepon: '',
  })

  const refresh = useCallback(async () => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (rt) qs.set('rt', rt)
    const [kkRes, stRes, pgRes] = await Promise.all([
      fetch(`/api/kk?${qs}`, { credentials: 'include' }),
      fetch('/api/kk?kind=stats', { credentials: 'include' }),
      fetch('/api/kk?kind=pengajuan', { credentials: 'include' }),
    ])
    if (kkRes.status === 401) {
      setAuthed(false)
      return
    }
    const kk = await kkRes.json()
    const st = await stRes.json()
    const pg = await pgRes.json()
    if (kk.ok) setItems(kk.items || [])
    if (st.ok) setStats(st.stats)
    if (pg.ok) setPengajuan(pg.items || [])
    setAuthed(true)
  }, [q, rt])

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      if (!cancelled) setBooting(false)
    }, 2000)
    ;(async () => {
      try {
        const r = await fetch('/api/auth/login', { credentials: 'include' })
        const j = await r.json()
        if (j.admin) {
          setAuthed(true)
          await refresh()
        }
      } catch {
        /* show login */
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [refresh])

  useEffect(() => {
    if (authed) void refresh()
  }, [q, rt, authed, refresh])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const j = await r.json()
      if (!j.ok) {
        setError('Kode akses salah')
        return
      }
      setAuthed(true)
      setPin('')
      await refresh()
    } catch {
      setError('Jaringan bermasalah')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    setAuthed(false)
    setItems([])
  }

  async function saveKk(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/kk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert_kk', ...form }),
      })
      const j = await r.json()
      if (!j.ok) {
        setError('Gagal simpan — cek NIK/No.KK 16 digit')
        return
      }
      setForm({
        noKk: '',
        kepalaKeluarga: '',
        nikKk: '',
        rt: '01',
        alamat: 'Jetis Sumur RT 01',
        telepon: '',
      })
      setTab('kk')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function review(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/pengajuan', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', id, status }),
    })
    await refresh()
  }

  if (booting && !authed) {
    return (
      <div className="page py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Memuat…
        </p>
        <button type="button" className="btn btn-ghost mt-3" onClick={() => setBooting(false)}>
          Lewati
        </button>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="page py-16 max-w-md mx-auto">
        <form onSubmit={login} className="card p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">Akses operator</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Panel internal — tidak dipublikasikan di navigasi situs.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="pin">
              Kode akses
            </label>
            <input
              id="pin"
              type="password"
              className="input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              minLength={4}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="page py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Panel operator</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Mode: {stats?.mode || '…'} · {stats?.totalKk ?? 0} KK · {stats?.totalJiwa ?? 0} jiwa
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn btn-ghost text-sm" href="/api/export?type=flat">
            Export CSV
          </a>
          <button type="button" className="btn btn-ghost text-sm" onClick={() => void refresh()}>
            Refresh
          </button>
          <button type="button" className="btn btn-ghost text-sm" onClick={() => void logout()}>
            Keluar
          </button>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          {[
            { l: 'KK aktif', v: stats.totalKk },
            { l: 'Jiwa', v: stats.totalJiwa },
            { l: 'L / P', v: `${stats.laki}/${stats.perempuan}` },
            { l: 'Pengajuan', v: stats.pendingPengajuan },
          ].map((s) => (
            <div key={s.l} className="card p-4">
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--accent)' }}>
                {s.v}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['kk', 'Daftar KK'],
            ['pengajuan', 'Pengajuan'],
            ['tambah', 'Tambah KK'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="btn text-sm"
            style={{
              background: tab === id ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--border)'}`,
              color: tab === id ? 'var(--accent)' : 'var(--text)',
            }}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'kk' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              className="input max-w-sm"
              placeholder="Cari nama / NIK / No.KK / alamat"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="input max-w-[8rem]" value={rt} onChange={(e) => setRt(e.target.value)}>
              <option value="">Semua RT</option>
              {['01', '02', '03', '04'].map((r) => (
                <option key={r} value={r}>
                  RT {r}
                </option>
              ))}
            </select>
          </div>
          <div className="table-wrap card">
            <table className="data">
              <thead>
                <tr>
                  <th>Kepala KK</th>
                  <th>No. KK</th>
                  <th>NIK</th>
                  <th>RT</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold">{row.kepalaKeluarga}</td>
                    <td className="font-mono text-xs">{row.noKk}</td>
                    <td className="font-mono text-xs">{maskNik(row.nikKk)}</td>
                    <td>{row.rt}</td>
                    <td>
                      <span className="badge">{row.status}</span>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--muted)' }}>
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pengajuan' && (
        <div className="space-y-3">
          {pengajuan.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Belum ada pengajuan.
            </p>
          )}
          {pengajuan.map((p) => (
            <article key={p.id} className="card p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                  {p.id}
                </p>
                <span className="badge">{p.status}</span>
              </div>
              <p className="font-semibold">{p.namaPelapor}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {p.telepon || '—'} · {p.jenis}
              </p>
              <pre
                className="text-xs overflow-x-auto p-2 rounded-lg"
                style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}
              >
                {JSON.stringify(p.payload, null, 2)}
              </pre>
              {p.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary text-sm"
                    onClick={() => void review(p.id, 'approved')}
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-sm"
                    onClick={() => void review(p.id, 'rejected')}
                  >
                    Tolak
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === 'tambah' && (
        <form onSubmit={saveKk} className="card p-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div className="sm:col-span-2">
            <h2 className="font-bold">Tambah / update KK</h2>
          </div>
          {(
            [
              ['noKk', 'No. KK (16 digit)'],
              ['nikKk', 'NIK kepala (16 digit)'],
              ['kepalaKeluarga', 'Nama kepala keluarga'],
              ['alamat', 'Alamat'],
              ['telepon', 'Telepon'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === 'alamat' || key === 'kepalaKeluarga' ? 'sm:col-span-2' : ''}>
              <label className="label">{label}</label>
              <input
                className="input"
                required={key !== 'telepon'}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [key]:
                      key === 'noKk' || key === 'nikKk'
                        ? e.target.value.replace(/\D/g, '').slice(0, 16)
                        : e.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div>
            <label className="label">RT</label>
            <select
              className="input"
              value={form.rt}
              onChange={(e) => setForm((f) => ({ ...f, rt: e.target.value }))}
            >
              {['01', '02', '03', '04'].map((r) => (
                <option key={r} value={r}>
                  RT {r}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="sm:col-span-2 text-sm" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan KK'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
