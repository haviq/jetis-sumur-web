/**
 * Data access layer: in-memory store + optional Google Sheets sync.
 * - mock mode: seed data, survives HMR via globalThis
 * - sheets mode: hydrate from spreadsheet, flush on every write
 */
import type {
  KK,
  Warga,
  Pengajuan,
  Stats,
  KKStatus,
  WargaStatus,
  Hubungan,
  JK,
} from '@/lib/types'
import { seedKk, seedWarga, seedPengajuan } from '@/lib/seed'
import {
  sheetsConfigured,
  loadAllFromSheets,
  flushAllToSheets,
  pingSheets,
} from '@/lib/sheets'

type Store = {
  kk: Map<string, KK>
  warga: Map<string, Warga>
  pengajuan: Map<string, Pengajuan>
  hydrated: boolean
  hydrating?: Promise<void>
}

const g = globalThis as unknown as { __jetisStore?: Store }

function store(): Store {
  if (!g.__jetisStore) {
    g.__jetisStore = {
      kk: new Map(seedKk.map((x) => [x.id, { ...x }])),
      warga: new Map(seedWarga.map((x) => [x.id, { ...x }])),
      pengajuan: new Map(seedPengajuan.map((x) => [x.id, { ...x }])),
      hydrated: !sheetsConfigured(),
    }
  }
  return g.__jetisStore
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export function dbMode(): 'mock' | 'sheets' {
  return sheetsConfigured() ? 'sheets' : 'mock'
}

/** Ensure sheets data loaded once per process (no-op in mock). */
export async function ensureHydrated(): Promise<void> {
  const s = store()
  if (s.hydrated || !sheetsConfigured()) {
    s.hydrated = true
    return
  }
  if (s.hydrating) {
    await s.hydrating
    return
  }
  s.hydrating = (async () => {
    try {
      const data = await loadAllFromSheets()
      // If sheet empty, keep seed and push seed up
      if (data.kk.length === 0 && data.warga.length === 0) {
        s.kk = new Map(seedKk.map((x) => [x.id, { ...x }]))
        s.warga = new Map(seedWarga.map((x) => [x.id, { ...x }]))
        s.pengajuan = new Map(seedPengajuan.map((x) => [x.id, { ...x }]))
        await persist()
      } else {
        s.kk = new Map(data.kk.map((x) => [x.id, x]))
        s.warga = new Map(data.warga.map((x) => [x.id, x]))
        s.pengajuan = new Map(data.pengajuan.map((x) => [x.id, x]))
      }
    } catch (e) {
      console.error('[jetis] sheets hydrate failed, using seed', e)
      // stay on seed
    } finally {
      s.hydrated = true
      s.hydrating = undefined
    }
  })()
  await s.hydrating
}

async function persist(): Promise<void> {
  if (!sheetsConfigured()) return
  const s = store()
  try {
    await flushAllToSheets({
      kk: Array.from(s.kk.values()),
      warga: Array.from(s.warga.values()),
      pengajuan: Array.from(s.pengajuan.values()),
    })
  } catch (e) {
    console.error('[jetis] sheets flush failed', e)
  }
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
    .sort((a, b) => {
      if (a.hubungan === 'Kepala Keluarga') return -1
      if (b.hubungan === 'Kepala Keluarga') return 1
      return a.nama.localeCompare(b.nama)
    })
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

export async function upsertKk(
  input: Omit<KK, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<KK> {
  await ensureHydrated()
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
  await persist()
  return row
}

export async function deleteKk(idKk: string): Promise<boolean> {
  await ensureHydrated()
  const k = store().kk.get(idKk)
  if (!k) return false
  k.status = 'nonaktif'
  k.updatedAt = new Date().toISOString()
  store().kk.set(idKk, k)
  await persist()
  return true
}

export async function upsertWarga(
  input: Omit<Warga, 'id' | 'updatedAt'> & { id?: string },
): Promise<Warga> {
  await ensureHydrated()
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
  await persist()
  return row
}

export async function deleteWarga(idW: string): Promise<boolean> {
  await ensureHydrated()
  const w = store().warga.get(idW)
  if (!w) return false
  w.status = 'pindah'
  w.updatedAt = new Date().toISOString()
  store().warga.set(idW, w)
  await persist()
  return true
}

export async function hardDeleteWarga(idW: string): Promise<boolean> {
  await ensureHydrated()
  const ok = store().warga.delete(idW)
  if (ok) await persist()
  return ok
}

export async function createPengajuan(input: {
  jenis: Pengajuan['jenis']
  namaPelapor: string
  telepon?: string
  payload: Record<string, unknown>
}): Promise<Pengajuan> {
  await ensureHydrated()
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
  await persist()
  return row
}

export async function listPengajuan(status?: Pengajuan['status']): Promise<Pengajuan[]> {
  await ensureHydrated()
  let rows = Array.from(store().pengajuan.values())
  if (status) rows = rows.filter((r) => r.status === status)
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function reviewPengajuan(
  idP: string,
  status: 'approved' | 'rejected',
  adminNote?: string,
): Promise<Pengajuan | null> {
  await ensureHydrated()
  const row = store().pengajuan.get(idP)
  if (!row) return null
  row.status = status
  row.reviewedAt = new Date().toISOString()
  row.adminNote = adminNote
  store().pengajuan.set(idP, row)
  await persist()
  return row
}

export async function getStats(): Promise<Stats> {
  await ensureHydrated()
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
  const pending = Array.from(store().pengajuan.values()).filter((p) => p.status === 'pending').length
  return {
    totalKk: kk.length,
    totalJiwa: warga.length,
    laki: warga.filter((w) => w.jk === 'L').length,
    perempuan: warga.filter((w) => w.jk === 'P').length,
    perRt,
    pendingPengajuan: pending,
    mode: dbMode(),
  }
}

export async function exportFlat(): Promise<
  {
    noKk: string
    kepala: string
    rt: string
    nik: string
    nama: string
    jk: string
    hubungan: string
    status: string
  }[]
> {
  await ensureHydrated()
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

export async function importFlatRows(
  rows: {
    noKk: string
    kepala: string
    rt: string
    nik: string
    nama: string
    jk?: string
    hubungan?: string
    status?: string
    alamat?: string
  }[],
): Promise<{ kk: number; warga: number }> {
  await ensureHydrated()
  let kkN = 0
  let wargaN = 0
  const kkByNo = new Map<string, string>()

  for (const r of rows) {
    const noKk = r.noKk.replace(/\D/g, '')
    if (noKk.length !== 16) continue
    let kkId = kkByNo.get(noKk)
    if (!kkId) {
      const existing = Array.from(store().kk.values()).find((k) => k.noKk === noKk)
      if (existing) {
        kkId = existing.id
      } else {
        const created = await upsertKk({
          noKk,
          kepalaKeluarga: r.kepala || r.nama,
          nikKk: r.nik.replace(/\D/g, '').slice(0, 16) || noKk,
          rt: r.rt || '01',
          rw: '01',
          alamat: r.alamat || `Jetis Sumur RT ${r.rt || '01'}`,
          dusun: 'Jetis Sumur',
          status: (r.status as KKStatus) === 'pindah' ? 'pindah' : 'aktif',
        })
        kkId = created.id
        kkN++
      }
      kkByNo.set(noKk, kkId)
    }

    const nik = r.nik.replace(/\D/g, '')
    if (nik.length !== 16) continue
    const existW = Array.from(store().warga.values()).find((w) => w.nik === nik)
    await upsertWarga({
      id: existW?.id,
      kkId,
      nik,
      nama: r.nama || r.kepala,
      jk: r.jk === 'P' ? 'P' : 'L',
      hubungan: (r.hubungan as Hubungan) || 'Lainnya',
      status: (r.status as WargaStatus) || 'aktif',
    })
    wargaN++
  }
  return { kk: kkN, warga: wargaN }
}

export { pingSheets }
// re-export types used by forms
export type { JK, Hubungan, WargaStatus, KKStatus }
