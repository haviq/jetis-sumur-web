'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AjukanForm() {
  const [namaPelapor, setNamaPelapor] = useState('')
  const [telepon, setTelepon] = useState('')
  const [noKk, setNoKk] = useState('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [doneId, setDoneId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: 'update',
          namaPelapor,
          telepon,
          payload: { noKk, catatan },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Gagal mengirim')
        return
      }
      setDoneId(data.item.id)
    } catch {
      setError('Jaringan bermasalah — coba lagi')
    } finally {
      setLoading(false)
    }
  }

  if (doneId) {
    return (
      <div className="card p-6 space-y-3 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          Pengajuan masuk
        </p>
        <p className="font-mono text-xl font-bold tracking-wide">{doneId}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Simpan kode ini. Petugas akan meninjau. Data resmi belum berubah.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={() => setDoneId(null)}>
            Lapor lagi
          </button>
          <Link href="/" className="btn btn-primary">
            Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 md:p-6 space-y-3.5">
      <div>
        <label className="label" htmlFor="nama">
          Nama pelapor *
        </label>
        <input
          id="nama"
          className="input"
          required
          minLength={3}
          value={namaPelapor}
          onChange={(e) => setNamaPelapor(e.target.value)}
          placeholder="Sesuai KTP"
        />
      </div>
      <div>
        <label className="label" htmlFor="tel">
          No. HP / WA
        </label>
        <input
          id="tel"
          className="input"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
        />
      </div>
      <div>
        <label className="label" htmlFor="kk">
          No. KK (opsional)
        </label>
        <input
          id="kk"
          className="input font-mono"
          value={noKk}
          onChange={(e) => setNoKk(e.target.value.replace(/\D/g, '').slice(0, 16))}
          placeholder="16 digit"
          inputMode="numeric"
        />
      </div>
      <div>
        <label className="label" htmlFor="cat">
          Apa yang perlu diubah? *
        </label>
        <textarea
          id="cat"
          className="input min-h-[120px]"
          required
          minLength={8}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: ganti nomor HP, tambah anak, koreksi alamat…"
        />
      </div>
      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Mengirim…' : 'Kirim'}
      </button>
    </form>
  )
}
