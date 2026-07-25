'use client'

import { useCallback, useEffect, useState } from 'react'
import type { KK, Stats, Pengajuan, Warga, Hubungan, JK, WargaStatus, KKStatus } from '@/lib/types'
import { maskNik } from '@/lib/utils'
import { StatusBadge, StatCard } from '@/components/ui'

const HUBUNGAN: Hubungan[] = [
  'Kepala Keluarga',
  'Istri',
  'Suami',
  'Anak',
  'Menantu',
  'Cucu',
  'Orang Tua',
  'Mertua',
  'Famili Lain',
  'Lainnya',
]

const emptyWargaForm = {
  nik: '',
  nama: '',
  jk: 'L' as JK,
  hubungan: 'Anak' as Hubungan,
  tglLahir: '',
  pekerjaan: '',
  status: 'aktif' as WargaStatus,
}

export default function OpsDashboard() {
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [rt, setRt] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | KKStatus>('')
  const [items, setItems] = useState<KK[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([])
  const [tab, setTab] = useState<'kk' | 'pengajuan' | 'tambah' | 'import' | 'demografi'>('kk')
  const [busy, setBusy] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailKk, setDetailKk] = useState<KK | null>(null)
  const [detailWarga, setDetailWarga] = useState<Warga[]>([])
  const [wargaForm, setWargaForm] = useState(emptyWargaForm)
  const [editingWargaId, setEditingWargaId] = useState<string | null>(null)
  const [importCsv, setImportCsv] = useState(
    'no_kk,kepala,rt,nik,nama,jk,hubungan,status\n3404010101010099,Contoh Import,01,3404010101990099,Contoh Import,L,Kepala Keluarga,aktif',
  )
  const [importMsg, setImportMsg] = useState('')
  const [sheetsMsg, setSheetsMsg] = useState('')

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
    if (statusFilter) qs.set('status', statusFilter)
    const [kkRes, stRes, pgRes, healthRes] = await Promise.all([
      fetch(`/api/kk?${qs}`, { credentials: 'include' }),
      fetch('/api/kk?kind=stats', { credentials: 'include' }),
      fetch('/api/kk?kind=pengajuan', { credentials: 'include' }),
      fetch('/api/health', { credentials: 'include' }),
    ])
    if (kkRes.status === 401) {
      setAuthed(false)
      return
    }
    const kk = await kkRes.json()
    const st = await stRes.json()
    const pg = await pgRes.json()
    const health = await healthRes.json()
    if (kk.ok) setItems(kk.items || [])
    if (st.ok) setStats(st.stats)
    if (pg.ok) setPengajuan(pg.items || [])
    if (health?.sheets?.message) setSheetsMsg(health.sheets.message)
    setAuthed(true)
  }, [q, rt, statusFilter])

  const loadDetail = useCallback(async (id: string) => {
    const r = await fetch(`/api/warga?id=${encodeURIComponent(id)}`, { credentials: 'include' })
    if (!r.ok) return
    const j = await r.json()
    if (j.ok) {
      setDetailKk(j.kk)
      setDetailWarga(j.warga || [])
    }
  }, [])

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
  }, [q, rt, statusFilter, authed, refresh])

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId)
  }, [selectedId, loadDetail])

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
    setSelectedId(null)
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
      if (j.item?.id) setSelectedId(j.item.id)
    } finally {
      setBusy(false)
    }
  }

  async function saveWarga(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/warga', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingWargaId || undefined,
          kkId: selectedId,
          ...wargaForm,
        }),
      })
      const j = await r.json()
      if (!j.ok) {
        setError('Gagal simpan anggota — NIK 16 digit & nama min 3')
        return
      }
      setWargaForm(emptyWargaForm)
      setEditingWargaId(null)
      await loadDetail(selectedId)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function softDeleteWarga(id: string) {
    if (!selectedId) return
    await fetch('/api/warga', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    await loadDetail(selectedId)
    await refresh()
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

  async function runImport(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setImportMsg('')
    try {
      const r = await fetch('/api/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: importCsv }),
      })
      const j = await r.json()
      if (!j.ok) {
        setImportMsg(j.error || 'Import gagal')
        return
      }
      setImportMsg(
        `Import OK · baris diproses ${j.totalRows} · KK baru ${j.imported?.kk ?? 0} · warga ${j.imported?.warga ?? 0}`,
      )
      await refresh()
      setTab('kk')
    } finally {
      setBusy(false)
    }
  }

  if (booting && !authed) {
    return (
      <div className="ops-shell login-shell">
        <div className="text-center space-y-3">
          <div className="brand-mark mx-auto">JS</div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Memuat panel…
          </p>
          <button type="button" className="btn btn-ghost" onClick={() => setBooting(false)}>
            Lewati
          </button>
        </div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="ops-shell login-shell">
        <form onSubmit={login} className="card p-6 md:p-7 space-y-4 w-full max-w-md glow-ring">
          <div className="space-y-2">
            <div className="brand-mark">JS</div>
            <h1 className="text-xl font-extrabold tracking-tight">Akses operator</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Panel internal pendataan — tidak dipublikasikan di navigasi situs.
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
              autoComplete="current-password"
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

  const maxAge = Math.max(1, ...(stats?.ageBuckets || []).map((b) => b.count))
  const maxRt = Math.max(1, ...(stats?.perRt || []).map((r) => r.jiwa))

  return (
    <div className="ops-shell">
      <div className="ops-topbar">
        <div className="page-wide py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="brand-mark">JS</span>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-extrabold truncate">Panel operator</h1>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                Mode {stats?.mode || '…'} · {stats?.totalKk ?? 0} KK · {stats?.totalJiwa ?? 0} jiwa
                {sheetsMsg ? ` · ${sheetsMsg}` : ''}
              </p>
            </div>
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
      </div>

      <div className="page-wide py-6 space-y-6">
      {stats && (
        <div className="stat-grid">
          <StatCard label="KK aktif" value={stats.totalKk} />
          <StatCard label="Jiwa aktif" value={stats.totalJiwa} />
          <StatCard label="L / P" value={`${stats.laki}/${stats.perempuan}`} />
          <StatCard label="Pengajuan pending" value={stats.pendingPengajuan} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['kk', 'Daftar KK'],
            ['pengajuan', `Pengajuan${stats?.pendingPengajuan ? ` (${stats.pendingPengajuan})` : ''}`],
            ['demografi', 'Demografi'],
            ['tambah', 'Tambah KK'],
            ['import', 'Import CSV'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="tab-btn"
            data-active={tab === id ? 'true' : 'false'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'kk' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
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
              <select
                className="input max-w-[9rem]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as '' | KKStatus)}
              >
                <option value="">Semua status</option>
                <option value="aktif">Aktif</option>
                <option value="pindah">Pindah</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Kepala KK</th>
                    <th>RT</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      style={{
                        cursor: 'pointer',
                        background:
                          selectedId === row.id ? 'var(--accent-dim)' : undefined,
                      }}
                    >
                      <td>
                        <div className="font-semibold">{row.kepalaKeluarga}</div>
                        <div className="font-mono text-xs" style={{ color: 'var(--muted2)' }}>
                          {row.noKk}
                        </div>
                      </td>
                      <td>{row.rt}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: 'var(--muted)' }}>
                        Tidak ada data — coba ubah filter atau tambah KK.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {!selectedId || !detailKk ? (
              <div className="card p-6 text-sm" style={{ color: 'var(--muted)' }}>
                Pilih KK di kiri untuk melihat anggota & menambah jiwa.
              </div>
            ) : (
              <>
                <div className="card p-5 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">{detailKk.kepalaKeluarga}</h2>
                      <p className="text-sm font-mono" style={{ color: 'var(--muted)' }}>
                        {detailKk.noKk} · NIK {maskNik(detailKk.nikKk)}
                      </p>
                    </div>
                    <span className="badge badge-sky">RT {detailKk.rt}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {detailKk.alamat}
                    {detailKk.telepon ? ` · ${detailKk.telepon}` : ''}
                  </p>
                </div>

                <div className="table-wrap card">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>NIK</th>
                        <th>JK</th>
                        <th>Hubungan</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailWarga.map((w) => (
                        <tr key={w.id}>
                          <td className="font-semibold">{w.nama}</td>
                          <td className="font-mono text-xs">{maskNik(w.nik)}</td>
                          <td>{w.jk}</td>
                          <td>{w.hubungan}</td>
                          <td>
                            <StatusBadge status={w.status} />
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="btn btn-ghost text-xs min-h-0 py-1 px-2"
                                onClick={() => {
                                  setEditingWargaId(w.id)
                                  setWargaForm({
                                    nik: w.nik,
                                    nama: w.nama,
                                    jk: w.jk,
                                    hubungan: w.hubungan,
                                    tglLahir: w.tglLahir || '',
                                    pekerjaan: w.pekerjaan || '',
                                    status: w.status,
                                  })
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost text-xs min-h-0 py-1 px-2"
                                onClick={() => void softDeleteWarga(w.id)}
                              >
                                Nonaktif
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {detailWarga.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ color: 'var(--muted)' }}>
                            Belum ada anggota
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={saveWarga} className="card p-5 grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <h3 className="font-bold text-sm">
                      {editingWargaId ? 'Edit anggota' : 'Tambah anggota'}
                    </h3>
                    {editingWargaId && (
                      <button
                        type="button"
                        className="text-xs"
                        style={{ color: 'var(--muted)' }}
                        onClick={() => {
                          setEditingWargaId(null)
                          setWargaForm(emptyWargaForm)
                        }}
                      >
                        Batal edit
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="label">NIK (16)</label>
                    <input
                      className="input"
                      required
                      value={wargaForm.nik}
                      onChange={(e) =>
                        setWargaForm((f) => ({
                          ...f,
                          nik: e.target.value.replace(/\D/g, '').slice(0, 16),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Nama</label>
                    <input
                      className="input"
                      required
                      minLength={3}
                      value={wargaForm.nama}
                      onChange={(e) => setWargaForm((f) => ({ ...f, nama: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">JK</label>
                    <select
                      className="input"
                      value={wargaForm.jk}
                      onChange={(e) => setWargaForm((f) => ({ ...f, jk: e.target.value as JK }))}
                    >
                      <option value="L">L</option>
                      <option value="P">P</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Hubungan</label>
                    <select
                      className="input"
                      value={wargaForm.hubungan}
                      onChange={(e) =>
                        setWargaForm((f) => ({ ...f, hubungan: e.target.value as Hubungan }))
                      }
                    >
                      {HUBUNGAN.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tgl lahir</label>
                    <input
                      className="input"
                      type="date"
                      value={wargaForm.tglLahir}
                      onChange={(e) => setWargaForm((f) => ({ ...f, tglLahir: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Pekerjaan</label>
                    <input
                      className="input"
                      value={wargaForm.pekerjaan}
                      onChange={(e) => setWargaForm((f) => ({ ...f, pekerjaan: e.target.value }))}
                    />
                  </div>
                  {error && (
                    <p className="sm:col-span-2 text-sm" style={{ color: 'var(--danger)' }}>
                      {error}
                    </p>
                  )}
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                      {busy ? 'Menyimpan…' : editingWargaId ? 'Update anggota' : 'Tambah anggota'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'pengajuan' && (
        <div className="space-y-3">
          {pengajuan.length === 0 && (
            <div className="empty-state card">
              <strong>Belum ada pengajuan</strong>
              <p className="text-sm">Form publik /ajukan akan muncul di sini.</p>
            </div>
          )}
          {pengajuan.map((p) => (
            <article key={p.id} className="card p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                  {p.id}
                </p>
                <StatusBadge status={p.status} />
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

      {tab === 'demografi' && stats && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5 space-y-4">
            <div>
              <h2 className="font-bold">Sebaran per RT</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                KK & jiwa aktif
              </p>
            </div>
            {(stats.perRt || []).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Belum ada data RT.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.perRt.map((r) => (
                  <div key={r.rt} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">RT {r.rt}</span>
                      <span style={{ color: 'var(--muted)' }}>
                        {r.kk} KK · {r.jiwa} jiwa
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.max(6, Math.round((r.jiwa / maxRt) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <div>
              <h2 className="font-bold">Kelompok usia</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Dari tanggal lahir anggota aktif (jika terisi)
              </p>
            </div>
            <div className="space-y-3">
              {(stats.ageBuckets || []).map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{b.label} th</span>
                    <span style={{ color: 'var(--muted)' }}>{b.count} jiwa</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(b.count ? 6 : 0, Math.round((b.count / maxAge) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-bold">Status KK</h2>
            <div className="flex flex-wrap gap-2">
              {(stats.kkByStatus || []).map((s) => (
                <span key={s.status} className="chip" data-active="true">
                  <StatusBadge status={s.status} /> {s.count}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-bold">Status jiwa</h2>
            <div className="flex flex-wrap gap-2">
              {(stats.wargaByStatus || []).map((s) => (
                <span key={s.status} className="chip" data-active="true">
                  <StatusBadge status={s.status} /> {s.count}
                </span>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted2)' }}>
              Laki-laki {stats.laki} · Perempuan {stats.perempuan} · Mode {stats.mode}
            </p>
          </div>
        </div>
      )}

      {tab === 'tambah' && (
        <form onSubmit={saveKk} className="card p-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div className="sm:col-span-2">
            <h2 className="font-bold">Tambah KK</h2>
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
            <div
              key={key}
              className={key === 'alamat' || key === 'kepalaKeluarga' ? 'sm:col-span-2' : ''}
            >
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

      {tab === 'import' && (
        <form onSubmit={runImport} className="card p-6 space-y-4 max-w-3xl">
          <div>
            <h2 className="font-bold">Import CSV</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Header wajib:{' '}
              <code className="text-xs">no_kk,kepala,rt,nik,nama,jk,hubungan,status</code>
            </p>
          </div>
          <textarea
            className="input min-h-[200px] font-mono text-xs"
            value={importCsv}
            onChange={(e) => setImportCsv(e.target.value)}
          />
          {importMsg && (
            <p className="text-sm" style={{ color: 'var(--accent)' }}>
              {importMsg}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Mengimpor…' : 'Jalankan import'}
          </button>
        </form>
      )}
      </div>
    </div>
  )
}
