/**
 * In-memory store + Sheets hydrate/flush — PRD v2 (Nuxt)
 */
import { sheetsConfigured } from './google-auth'
import { loadFromSheets, saveToSheets, sheetsModeLabel } from './sheets'
import {
  defaultAkun,
  defaultBerita,
  defaultKeluarga,
  defaultMaster,
  defaultMutasi,
  defaultWarga,
} from './seed'
import type {
  AdminStats,
  Akun,
  Berita,
  Keluarga,
  LogAktivitas,
  MasterItem,
  Mutasi,
  MutasiJenis,
  PublicStats,
  Role,
  SessionUser,
  Warga,
  WargaStatus,
} from './types'

type Store = {
  akun: Map<string, Akun>
  keluarga: Map<string, Keluarga>
  warga: Map<string, Warga>
  mutasi: Map<string, Mutasi>
  logs: LogAktivitas[]
  master: MasterItem[]
  berita: Map<string, Berita>
  hydrated: boolean
  hydrating?: Promise<void>
  dirty: boolean
}

const g = globalThis as unknown as { __jetisStoreV2?: Store }

function store(): Store {
  if (!g.__jetisStoreV2) {
    g.__jetisStoreV2 = {
      akun: new Map(),
      keluarga: new Map(),
      warga: new Map(),
      mutasi: new Map(),
      logs: [],
      master: [],
      berita: new Map(),
      hydrated: false,
      dirty: false,
    }
  }
  return g.__jetisStoreV2
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function ageFromIso(tgl?: string): number | null {
  if (!tgl || !/^\d{4}-\d{2}-\d{2}/.test(tgl)) return null
  const d = new Date(tgl)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age >= 0 && age < 130 ? age : null
}

function seedStore(s: Store) {
  s.akun.clear()
  s.keluarga.clear()
  s.warga.clear()
  s.mutasi.clear()
  s.logs = []
  s.master = defaultMaster()
  s.berita.clear()
  for (const a of defaultAkun()) s.akun.set(a.id, a)
  for (const k of defaultKeluarga()) s.keluarga.set(k.id, k)
  for (const w of defaultWarga()) s.warga.set(w.id, w)
  for (const m of defaultMutasi()) s.mutasi.set(m.id, m)
  for (const b of defaultBerita()) s.berita.set(b.id, b)
}

export function dbMode(): 'mock' | 'sheets' {
  return sheetsModeLabel()
}

export async function ensureHydrated(): Promise<void> {
  const s = store()
  if (s.hydrated) return
  if (s.hydrating) return s.hydrating
  s.hydrating = (async () => {
    if (sheetsConfigured()) {
      try {
        const b = await loadFromSheets()
        s.akun.clear()
        s.keluarga.clear()
        s.warga.clear()
        s.mutasi.clear()
        s.berita.clear()
        for (const a of b.akun) s.akun.set(a.id, a)
        for (const k of b.keluarga) s.keluarga.set(k.id, k)
        for (const w of b.warga) s.warga.set(w.id, w)
        for (const m of b.mutasi) s.mutasi.set(m.id, m)
        s.logs = b.logs || []
        s.master = b.master?.length ? b.master : defaultMaster()
        for (const x of b.berita || []) s.berita.set(x.id, x)
        if (s.akun.size === 0) {
          for (const a of defaultAkun()) s.akun.set(a.id, a)
          s.dirty = true
        }
        if (s.keluarga.size === 0) {
          for (const k of defaultKeluarga()) s.keluarga.set(k.id, k)
          for (const w of defaultWarga()) s.warga.set(w.id, w)
          for (const m of defaultMutasi()) s.mutasi.set(m.id, m)
          s.dirty = true
        }
        if (s.berita.size === 0) {
          for (const b of defaultBerita()) s.berita.set(b.id, b)
          s.dirty = true
        }
        if (s.dirty) await flushSheets()
      } catch (e) {
        console.error('[jetis] sheets hydrate failed, using seed', e)
        seedStore(s)
      }
    } else {
      seedStore(s)
    }
    s.hydrated = true
    s.hydrating = undefined
  })()
  return s.hydrating
}

async function flushSheets(): Promise<void> {
  const s = store()
  if (!sheetsConfigured()) return
  try {
    await saveToSheets({
      akun: Array.from(s.akun.values()),
      keluarga: Array.from(s.keluarga.values()),
      warga: Array.from(s.warga.values()),
      mutasi: Array.from(s.mutasi.values()),
      logs: s.logs,
      master: s.master,
      berita: Array.from(s.berita.values()),
    })
    s.dirty = false
  } catch (e) {
    console.error('[jetis] sheets flush failed', e)
  }
}

function markDirty() {
  store().dirty = true
  void flushSheets()
}

export function addLog(user: string, aktivitas: string, ip?: string) {
  const s = store()
  s.logs.push({
    id: uid('log'),
    user,
    aktivitas,
    waktu: new Date().toISOString(),
    ip,
  })
  if (s.logs.length > 800) s.logs = s.logs.slice(-500)
  markDirty()
}

export async function findAkunByUsername(username: string): Promise<Akun | null> {
  await ensureHydrated()
  const u = username.trim().toLowerCase()
  for (const a of Array.from(store().akun.values())) {
    if (a.username.toLowerCase() === u) return a
  }
  return null
}

export async function touchLogin(id: string) {
  await ensureHydrated()
  const a = store().akun.get(id)
  if (!a) return
  a.lastLogin = new Date().toISOString()
  store().akun.set(id, a)
  markDirty()
}

export async function listAkun(): Promise<Omit<Akun, 'passwordHash'>[]> {
  await ensureHydrated()
  return Array.from(store().akun.values()).map(({ passwordHash: _, ...rest }) => rest)
}

export async function upsertAkun(input: Omit<Akun, 'id'> & { id?: string }): Promise<Akun> {
  await ensureHydrated()
  const id = input.id || uid('u')
  const existing = store().akun.get(id)
  const row: Akun = {
    id,
    nama: input.nama,
    username: input.username,
    passwordHash: input.passwordHash || existing?.passwordHash || '',
    role: input.role,
    status: input.status,
    lastLogin: input.lastLogin || existing?.lastLogin,
  }
  store().akun.set(id, row)
  markDirty()
  return row
}

export function listKeluarga(opts?: { q?: string; rt?: string }): Keluarga[] {
  let rows = Array.from(store().keluarga.values())
  if (opts?.rt) rows = rows.filter((r) => r.rt === opts.rt)
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim()
    rows = rows.filter(
      (r) =>
        r.kepalaKeluarga.toLowerCase().includes(q) ||
        r.nomorKk.includes(q) ||
        r.alamat.toLowerCase().includes(q),
    )
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getKeluargaByNomor(nomorKk: string): Keluarga | null {
  for (const k of Array.from(store().keluarga.values())) {
    if (k.nomorKk === nomorKk) return k
  }
  return null
}

export async function upsertKeluarga(
  input: Omit<Keluarga, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  actor?: SessionUser,
): Promise<Keluarga> {
  await ensureHydrated()
  const t = new Date().toISOString()
  const id = input.id || uid('kk')
  const prev = store().keluarga.get(id)
  const row: Keluarga = {
    id,
    nomorKk: input.nomorKk,
    kepalaKeluarga: input.kepalaKeluarga,
    rt: input.rt,
    rw: input.rw || '01',
    alamat: input.alamat,
    latitude: input.latitude,
    longitude: input.longitude,
    statusRumah: input.statusRumah,
    createdAt: prev?.createdAt || t,
    updatedAt: t,
  }
  store().keluarga.set(id, row)
  if (actor) addLog(actor.username, `upsert_kk ${row.nomorKk}`)
  markDirty()
  return row
}

export async function deleteKeluarga(id: string, actor?: SessionUser): Promise<boolean> {
  await ensureHydrated()
  const k = store().keluarga.get(id)
  if (!k) return false
  store().keluarga.delete(id)
  for (const [wid, w] of Array.from(store().warga.entries())) {
    if (w.nomorKk === k.nomorKk) store().warga.delete(wid)
  }
  if (actor) addLog(actor.username, `delete_kk ${k.nomorKk}`)
  markDirty()
  return true
}

export function listWarga(opts?: {
  q?: string
  status?: WargaStatus
  nomorKk?: string
  rt?: string
}): Warga[] {
  let rows = Array.from(store().warga.values())
  if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
  if (opts?.nomorKk) rows = rows.filter((r) => r.nomorKk === opts.nomorKk)
  if (opts?.rt) {
    const nks = new Set(
      Array.from(store().keluarga.values())
        .filter((k) => k.rt === opts.rt)
        .map((k) => k.nomorKk),
    )
    rows = rows.filter((r) => nks.has(r.nomorKk))
  }
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim()
    rows = rows.filter(
      (r) => r.nama.toLowerCase().includes(q) || r.nik.includes(q) || r.nomorKk.includes(q),
    )
  }
  return rows.sort((a, b) => a.nama.localeCompare(b.nama))
}

export function findWargaByNik(nik: string): Warga | null {
  for (const w of Array.from(store().warga.values())) {
    if (w.nik === nik) return w
  }
  return null
}

export async function upsertWarga(
  input: Omit<Warga, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  actor?: SessionUser,
): Promise<Warga> {
  await ensureHydrated()
  const t = new Date().toISOString()
  const id = input.id || uid('w')
  const prev = store().warga.get(id)
  const row: Warga = {
    ...input,
    id,
    createdAt: prev?.createdAt || t,
    updatedAt: t,
  }
  store().warga.set(id, row)
  if (actor) addLog(actor.username, `upsert_warga ${row.nik} ${row.nama}`)
  markDirty()
  return row
}

export async function deleteWarga(id: string, actor?: SessionUser): Promise<boolean> {
  await ensureHydrated()
  const w = store().warga.get(id)
  if (!w) return false
  store().warga.delete(id)
  if (actor) addLog(actor.username, `delete_warga ${w.nik}`)
  markDirty()
  return true
}

export function listMutasi(): Mutasi[] {
  return Array.from(store().mutasi.values()).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

export async function addMutasi(
  input: Omit<Mutasi, 'id' | 'createdAt'> & { id?: string },
  actor?: SessionUser,
): Promise<Mutasi> {
  await ensureHydrated()
  const row: Mutasi = {
    id: input.id || uid('mut'),
    nik: input.nik,
    nama: input.nama,
    jenis: input.jenis,
    tanggal: input.tanggal,
    keterangan: input.keterangan,
    createdBy: actor?.username || input.createdBy,
    createdAt: new Date().toISOString(),
  }
  store().mutasi.set(row.id, row)
  const w = findWargaByNik(row.nik)
  if (w) {
    if (row.jenis === 'meninggal') w.status = 'meninggal'
    if (row.jenis === 'keluar' || row.jenis === 'pindah_keluar') w.status = 'pindah'
    if (row.jenis === 'masuk' || row.jenis === 'pindah_datang' || row.jenis === 'lahir')
      w.status = 'aktif'
    w.updatedAt = new Date().toISOString()
    store().warga.set(w.id, w)
  }
  if (actor) addLog(actor.username, `mutasi ${row.jenis} ${row.nik}`)
  markDirty()
  return row
}

export function listMaster(kategori?: MasterItem['kategori']): MasterItem[] {
  let rows = store().master
  if (kategori) rows = rows.filter((r) => r.kategori === kategori)
  return rows.sort((a, b) => a.urutan - b.urutan || a.nilai.localeCompare(b.nilai))
}

export async function setMaster(items: MasterItem[], actor?: SessionUser) {
  await ensureHydrated()
  store().master = items
  if (actor) addLog(actor.username, 'update_master')
  markDirty()
}

export function listBerita(all = false): Berita[] {
  return Array.from(store().berita.values())
    .filter((b) => all || b.published)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

export async function upsertBerita(input: Berita, actor?: SessionUser) {
  await ensureHydrated()
  store().berita.set(input.id, input)
  if (actor) addLog(actor.username, `upsert_berita ${input.id}`)
  markDirty()
  return input
}

export function listLogs(limit = 50): LogAktivitas[] {
  return store().logs.slice(-limit).reverse()
}

function countBy(labels: string[]): { label: string; count: number }[] {
  const m = new Map<string, number>()
  for (const l of labels) {
    const k = l || 'Tidak diisi'
    m.set(k, (m.get(k) || 0) + 1)
  }
  return Array.from(m.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPublicStats(): Promise<PublicStats> {
  await ensureHydrated()
  const warga = Array.from(store().warga.values()).filter((w) => w.status === 'aktif')
  const kk = Array.from(store().keluarga.values())
  const rts = Array.from(new Set(kk.map((k) => k.rt))).sort()
  const rws = Array.from(new Set(kk.map((k) => k.rw))).sort()

  const perRt = rts.map((rt) => {
    const kkRt = kk.filter((k) => k.rt === rt)
    const nks = new Set(kkRt.map((k) => k.nomorKk))
    return { rt, kk: kkRt.length, jiwa: warga.filter((w) => nks.has(w.nomorKk)).length }
  })
  const perRw = rws.map((rw) => {
    const kkRw = kk.filter((k) => k.rw === rw)
    const nks = new Set(kkRw.map((k) => k.nomorKk))
    return { rw, kk: kkRw.length, jiwa: warga.filter((w) => nks.has(w.nomorKk)).length }
  })

  let balita = 0,
    anak = 0,
    remaja = 0,
    dewasa = 0,
    lansia = 0
  for (const w of warga) {
    const a = ageFromIso(w.tanggalLahir)
    if (a == null) continue
    if (a <= 5) balita++
    else if (a <= 12) anak++
    else if (a <= 17) remaja++
    else if (a <= 59) dewasa++
    else lansia++
  }

  return {
    totalPenduduk: warga.length,
    totalKk: kk.length,
    laki: warga.filter((w) => w.jk === 'L').length,
    perempuan: warga.filter((w) => w.jk === 'P').length,
    balita,
    anak,
    remaja,
    dewasa,
    lansia,
    perRt,
    perRw,
    pendidikan: countBy(warga.map((w) => w.pendidikan || '')),
    pekerjaan: countBy(warga.map((w) => w.pekerjaan || '')),
    agama: countBy(warga.map((w) => w.agama || '')),
    mode: dbMode(),
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const base = await getPublicStats()
  const mut = Array.from(store().mutasi.values())
  const countJenis = (j: MutasiJenis) => mut.filter((m) => m.jenis === j).length
  return {
    ...base,
    masuk: countJenis('masuk'),
    keluar: countJenis('keluar'),
    lahir: countJenis('lahir'),
    meninggal: countJenis('meninggal'),
    pindahDatang: countJenis('pindah_datang'),
    pindahKeluar: countJenis('pindah_keluar'),
    recentLogs: listLogs(12),
    recentMutasi: listMutasi().slice(0, 12),
  }
}

export function roleCan(
  role: Role,
  action: 'read' | 'write' | 'mutasi' | 'import' | 'master' | 'users' | 'audit',
): boolean {
  if (role === 'super_admin') return true
  if (role === 'admin') return action !== 'users'
  return action === 'read' || action === 'write'
}
