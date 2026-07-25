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
      setError('Jaringan bermasalah')
    } finally {
      setLoading(false)
    }
  }

  if (doneId) {
    return (
      <div className="card p-6 md:p-8 space-y-4 text-center glow-ring">
        <p className="eyebrow justify-center">Terkirim</p>
        <p className="font-mono text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>
          {doneId}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          Simpan kode ini. Petugas akan meninjau pengajuan Anda. Perubahan tidak langsung masuk data
          resmi.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={() => setDoneId(null)}>
            Ajukan lagi
          </button>
          <Link href="/" className="btn btn-primary">
            Kembali beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-7 space-y-4">
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
          Data yang ingin diubah / ditambahkan *
        </label>
        <textarea
          id="cat"
          className="input min-h-[120px]"
          required
          minLength={8}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: ganti nomor HP, tambah anggota, koreksi alamat…"
        />
      </div>
      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Mengirim…' : 'Kirim pengajuan'}
      </button>
    </form>
  )
}
