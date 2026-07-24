/**
 * In-memory DB (demo / local).
 * When Sheets env is configured later, lib/db/index switches adapter.
 * Survives HMR via globalThis.
 */
import type { KK, Warga, Pengajuan, Stats, KKStatus, WargaStatus } from '@/lib/types'
import { seedKk, seedWarga, seedPengajuan } from '@/lib/seed'

type Store = {
  kk: Map<string, KK>
  warga: Map<string, Warga>
  pengajuan: Map<string, Pengajuan>
}

const g = globalThis as unknown as { __jetisStore?: Store }

function store(): Store {
  if (!g.__jetisStore) {
    g.__jetisStore = {
      kk: new Map(seedKk.map((x) => [x.id, { ...x }])),
      warga: new Map(seedWarga.map((x) => [x.id, { ...x }])),
      pengajuan: new Map(seedPengajuan.map((x) => [x.id, { ...x }])),
    }
  }
  return g.__jetisStore
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export function dbMode(): 'mock' | 'sheets' {
  // Sheets adapter wired later; env presence reserved
  if (
    process.env.SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  ) {
    return 'sheets' // will still use mock until sheets impl ships fully
  }
  return 'mock'
}

export function listKk(opts?: { q?: string; rt?: string; status?: KKStatus }): KK[] {
  let rows = Array.from(store().kk.values())
  if (opts?.rt) rows = rows.filter((r) => r.rt === opts.rt)
  if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim()
    rows = rows.filter(
      (r) =>
        r.kepalaKeluarga.toLowerCase().includes(q) ||
        r.noKk.includes(q) ||
        r.nikKk.includes(q) ||
        r.alamat.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    )
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getKk(idKk: string): KK | null {
  return store().kk.get(idKk) || null
}

export function listWargaByKk(kkId: string): Warga[] {
  return Array.from(store().warga.values())
    .filter((w) => w.kkId === kkId)
    .sort((a, b) => a.nama.localeCompare(b.nama))
}

export function listWarga(opts?: { q?: string; status?: WargaStatus }): Warga[] {
  let rows = Array.from(store().warga.values())
  if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim()
    rows = rows.filter(
      (r) => r.nama.toLowerCase().includes(q) || r.nik.includes(q) || r.kkId.toLowerCase().includes(q),
    )
  }
  return rows.sort((a, b) => a.nama.localeCompare(b.nama))
}

export function upsertKk(input: Omit<KK, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): KK {
  const now = new Date().toISOString()
  const existing = input.id ? store().kk.get(input.id) : undefined
  const row: KK = {
    id: existing?.id || input.id || id('KK'),
    noKk: input.noKk,
    kepalaKeluarga: input.kepalaKeluarga,
    nikKk: input.nikKk,
    rt: input.rt,
    rw: input.rw || '01',
    alamat: input.alamat,
    dusun: input.dusun || 'Jetis Sumur',
    status: input.status,
    telepon: input.telepon,
    catatan: input.catatan,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  store().kk.set(row.id, row)
  return row
}

export function deleteKk(idKk: string): boolean {
  const k = store().kk.get(idKk)
  if (!k) return false
  k.status = 'nonaktif'
  k.updatedAt = new Date().toISOString()
  store().kk.set(idKk, k)
  return true
}

export function upsertWarga(
  input: Omit<Warga, 'id' | 'updatedAt'> & { id?: string },
): Warga {
  const now = new Date().toISOString()
  const existing = input.id ? store().warga.get(input.id) : undefined
  const row: Warga = {
    id: existing?.id || input.id || id('W'),
    kkId: input.kkId,
    nik: input.nik,
    nama: input.nama,
    jk: input.jk,
    tempatLahir: input.tempatLahir,
    tglLahir: input.tglLahir,
    hubungan: input.hubungan,
    agama: input.agama,
    pendidikan: input.pendidikan,
    pekerjaan: input.pekerjaan,
    statusKawin: input.statusKawin,
    status: input.status,
    updatedAt: now,
  }
  store().warga.set(row.id, row)
  return row
}

export function deleteWarga(idW: string): boolean {
  const w = store().warga.get(idW)
  if (!w) return false
  w.status = 'pindah'
  w.updatedAt = new Date().toISOString()
  store().warga.set(idW, w)
  return true
}

export function createPengajuan(input: {
  jenis: Pengajuan['jenis']
  namaPelapor: string
  telepon?: string
  payload: Record<string, unknown>
}): Pengajuan {
  const row: Pengajuan = {
    id: id('PG'),
    jenis: input.jenis,
    namaPelapor: input.namaPelapor,
    telepon: input.telepon,
    payload: input.payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  store().pengajuan.set(row.id, row)
  return row
}

export function listPengajuan(status?: Pengajuan['status']): Pengajuan[] {
  let rows = Array.from(store().pengajuan.values())
  if (status) rows = rows.filter((r) => r.status === status)
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function reviewPengajuan(
  idP: string,
  status: 'approved' | 'rejected',
  adminNote?: string,
): Pengajuan | null {
  const row = store().pengajuan.get(idP)
  if (!row) return null
  row.status = status
  row.reviewedAt = new Date().toISOString()
  row.adminNote = adminNote
  store().pengajuan.set(idP, row)
  return row
}

export function getStats(): Stats {
  const kk = Array.from(store().kk.values()).filter((k) => k.status === 'aktif')
  const warga = Array.from(store().warga.values()).filter((w) => w.status === 'aktif')
  const rts = Array.from(new Set([...kk.map((k) => k.rt)])).sort()
  const perRt = rts.map((rt) => {
    const kkRt = kk.filter((k) => k.rt === rt)
    const ids = new Set(kkRt.map((k) => k.id))
    return {
      rt,
      kk: kkRt.length,
      jiwa: warga.filter((w) => ids.has(w.kkId)).length,
    }
  })
  return {
    totalKk: kk.length,
    totalJiwa: warga.length,
    laki: warga.filter((w) => w.jk === 'L').length,
    perempuan: warga.filter((w) => w.jk === 'P').length,
    perRt,
    pendingPengajuan: listPengajuan('pending').length,
    mode: dbMode(),
  }
}

export function exportFlat(): {
  noKk: string
  kepala: string
  rt: string
  nik: string
  nama: string
  jk: string
  hubungan: string
  status: string
}[] {
  const rows: {
    noKk: string
    kepala: string
    rt: string
    nik: string
    nama: string
    jk: string
    hubungan: string
    status: string
  }[] = []
  for (const k of listKk()) {
    const members = listWargaByKk(k.id)
    if (members.length === 0) {
      rows.push({
        noKk: k.noKk,
        kepala: k.kepalaKeluarga,
        rt: k.rt,
        nik: k.nikKk,
        nama: k.kepalaKeluarga,
        jk: '',
        hubungan: 'Kepala Keluarga',
        status: k.status,
      })
    } else {
      for (const w of members) {
        rows.push({
          noKk: k.noKk,
          kepala: k.kepalaKeluarga,
          rt: k.rt,
          nik: w.nik,
          nama: w.nama,
          jk: w.jk,
          hubungan: w.hubungan,
          status: w.status,
        })
      }
    }
  }
  return rows
}
