'use client'

import { useCallback, useEffect, useState } from 'react'
import type { KK, Stats, Pengajuan, Warga, Hubungan, JK, WargaStatus } from '@/lib/types'
import { maskNik } from '@/lib/utils'

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
  const [items, setItems] = useState<KK[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([])
  const [tab, setTab] = useState<'kk' | 'pengajuan' | 'tambah' | 'import'>('kk')
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
  }, [q, rt])

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
  }, [q, rt, authed, refresh])

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
          {sheetsMsg && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted2)' }}>
              {sheetsMsg}
            </p>
          )}
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
            ['import', 'Import CSV'],
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
            </div>
            <div className="table-wrap card">
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
                        <span className="badge">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: 'var(--muted)' }}>
                        Tidak ada data
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
                    <span className="badge">RT {detailKk.rt}</span>
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
                            <span className="badge">{w.status}</span>
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
  )
}
