/**
 * In-memory store + Sheets hydrate/flush — PRD v2+ (20 fitur)
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
  Kk360,
  LogAktivitas,
  MasterItem,
  Mutasi,
  MutasiJenis,
  PortalPengajuan,
  PortalStatus,
  PublicStats,
  Role,
  SessionUser,
  SuratArsip,
  SuratJenis,
  SuratStatus,
  Warga,
  WargaStatus,
} from './types'
import { humanizeAktivitas, maskNik } from './validate'

type Store = {
  akun: Map<string, Akun>
  keluarga: Map<string, Keluarga>
  warga: Map<string, Warga>
  mutasi: Map<string, Mutasi>
  logs: LogAktivitas[]
  master: MasterItem[]
  berita: Map<string, Berita>
  surat: Map<string, SuratArsip>
  portal: Map<string, PortalPengajuan>
  hydrated: boolean
  hydrating?: Promise<void>
  dirty: boolean
}

const g = globalThis as unknown as { __jetisStoreV3?: Store }

function store(): Store {
  if (!g.__jetisStoreV3) {
    g.__jetisStoreV3 = {
      akun: new Map(),
      keluarga: new Map(),
      warga: new Map(),
      mutasi: new Map(),
      logs: [],
      master: [],
      berita: new Map(),
      surat: new Map(),
      portal: new Map(),
      hydrated: false,
      dirty: false,
    }
  }
  return g.__jetisStoreV3
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function token(n = 16): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function ageFromIso(tgl?: string): number | null {
  if (!tgl || !/^\d{4}-\d{2}-\d{2}/.test(tgl)) return null
  const d = new Date(tgl)
  if (isNaN(d.getTime())) return null
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
  s.surat.clear()
  s.portal.clear()
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
        s.surat.clear()
        s.portal.clear()
        for (const a of b.akun) s.akun.set(a.id, a)
        for (const k of b.keluarga) s.keluarga.set(k.id, k)
        for (const w of b.warga) s.warga.set(w.id, w)
        for (const m of b.mutasi) s.mutasi.set(m.id, m)
        s.logs = b.logs || []
        s.master = b.master?.length ? b.master : defaultMaster()
        for (const x of b.berita || []) s.berita.set(x.id, x)
        for (const x of b.surat || []) s.surat.set(x.id, x)
        for (const x of b.portal || []) s.portal.set(x.id, x)
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
      surat: Array.from(s.surat.values()),
      portal: Array.from(s.portal.values()),
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
    human: humanizeAktivitas(aktivitas),
    waktu: new Date().toISOString(),
    ip,
  })
  if (s.logs.length > 800) s.logs = s.logs.slice(-500)
  markDirty()
}

/** Scope helper — filter by operator RT */
export function scopeRts(actor?: SessionUser | null): string[] | null {
  if (!actor?.rtScope?.length) return null
  if (actor.role === 'super_admin' || actor.role === 'admin') return null
  return actor.rtScope
}

function inRtScope(rt: string, scope: string[] | null): boolean {
  if (!scope) return true
  return scope.includes(rt)
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
    rtScope: input.rtScope !== undefined ? input.rtScope : existing?.rtScope,
    lastLogin: input.lastLogin || existing?.lastLogin,
  }
  store().akun.set(id, row)
  markDirty()
  return row
}

export function listKeluarga(opts?: { q?: string; rt?: string; scope?: string[] | null }): Keluarga[] {
  let rows = Array.from(store().keluarga.values())
  const scope = opts?.scope ?? null
  if (scope) rows = rows.filter((r) => inRtScope(r.rt, scope))
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

export function getKeluargaById(id: string): Keluarga | null {
  return store().keluarga.get(id) || null
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
  includeDeleted?: boolean
  scope?: string[] | null
}): Warga[] {
  let rows = Array.from(store().warga.values())
  if (!opts?.includeDeleted) rows = rows.filter((r) => r.status !== 'deleted')
  if (opts?.status) rows = rows.filter((r) => r.status === opts.status)
  if (opts?.nomorKk) rows = rows.filter((r) => r.nomorKk === opts.nomorKk)
  if (opts?.rt || opts?.scope) {
    const nks = new Set(
      Array.from(store().keluarga.values())
        .filter((k) => {
          if (opts?.rt && k.rt !== opts.rt) return false
          if (opts?.scope && !inRtScope(k.rt, opts.scope)) return false
          return true
        })
        .map((k) => k.nomorKk),
    )
    if (opts?.rt || opts?.scope) rows = rows.filter((r) => nks.has(r.nomorKk))
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
    if (w.nik === nik && w.status !== 'deleted') return w
  }
  return null
}

export function getWargaById(id: string): Warga | null {
  return store().warga.get(id) || null
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
    deletedAt: input.status === 'deleted' ? input.deletedAt || t : undefined,
    createdAt: prev?.createdAt || t,
    updatedAt: t,
  }
  store().warga.set(id, row)
  if (actor) addLog(actor.username, `upsert_warga ${row.nik} ${row.nama}`)
  markDirty()
  return row
}

/** Soft-delete compliance */
export async function deleteWarga(id: string, actor?: SessionUser, hard = false): Promise<boolean> {
  await ensureHydrated()
  const w = store().warga.get(id)
  if (!w) return false
  if (hard) {
    store().warga.delete(id)
  } else {
    w.status = 'deleted'
    w.deletedAt = new Date().toISOString()
    w.updatedAt = w.deletedAt
    store().warga.set(id, w)
  }
  if (actor) addLog(actor.username, `delete_warga ${w.nik}`)
  markDirty()
  return true
}

export async function restoreWarga(id: string, actor?: SessionUser): Promise<Warga | null> {
  await ensureHydrated()
  const w = store().warga.get(id)
  if (!w) return null
  w.status = 'aktif'
  w.deletedAt = undefined
  w.updatedAt = new Date().toISOString()
  store().warga.set(id, w)
  if (actor) addLog(actor.username, `restore_warga ${w.nik}`)
  markDirty()
  return w
}

export function listMutasi(opts?: { since?: string; nik?: string }): Mutasi[] {
  let rows = Array.from(store().mutasi.values())
  if (opts?.nik) rows = rows.filter((m) => m.nik === opts.nik)
  if (opts?.since) rows = rows.filter((m) => m.tanggal >= opts.since!)
  return rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.createdAt.localeCompare(a.createdAt))
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
  if (actor) addLog(actor.username, `add_mutasi ${row.jenis} ${row.nik}`)
  markDirty()
  return row
}

export function listLogs(limit = 100): LogAktivitas[] {
  return store()
    .logs.slice()
    .reverse()
    .slice(0, limit)
    .map((l) => ({
      ...l,
      human: l.human || humanizeAktivitas(l.aktivitas),
    }))
}

export function listMaster(): MasterItem[] {
  return store().master.slice().sort((a, b) => a.urutan - b.urutan)
}

export async function upsertMaster(item: MasterItem): Promise<MasterItem> {
  await ensureHydrated()
  const s = store()
  const idx = s.master.findIndex((m) => m.id === item.id)
  if (idx >= 0) s.master[idx] = item
  else s.master.push(item)
  markDirty()
  return item
}

export function listBerita(publishedOnly = true): Berita[] {
  let rows = Array.from(store().berita.values())
  if (publishedOnly) rows = rows.filter((b) => b.published)
  return rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

/* ─── KK 360° ─── */
export function getKk360(nomorKk: string): Kk360 | null {
  const kk = getKeluargaByNomor(nomorKk)
  if (!kk) return null
  const anggota = listWarga({ nomorKk, includeDeleted: false })
  const niks = new Set(anggota.map((a) => a.nik))
  const mutasi = listMutasi().filter((m) => niks.has(m.nik)).slice(0, 40)
  const surat = listSurat().filter((s) => niks.has(s.nik)).slice(0, 20)
  return {
    kk,
    anggota,
    mutasi,
    surat,
    ringkas: {
      jiwa: anggota.length,
      laki: anggota.filter((a) => a.jk === 'L').length,
      perempuan: anggota.filter((a) => a.jk === 'P').length,
      aktif: anggota.filter((a) => a.status === 'aktif').length,
    },
  }
}

/* ─── Global search ─── */
export function globalSearch(q: string, scope?: string[] | null, limit = 20) {
  const query = q.trim().toLowerCase()
  if (query.length < 2) return { warga: [] as Warga[], kk: [] as Keluarga[], mutasi: [] as Mutasi[] }
  const warga = listWarga({ q: query, scope }).slice(0, limit)
  const kk = listKeluarga({ q: query, scope }).slice(0, limit)
  const mutasi = listMutasi()
    .filter(
      (m) =>
        m.nik.includes(query) ||
        (m.nama || '').toLowerCase().includes(query) ||
        String(m.jenis).includes(query),
    )
    .slice(0, Math.min(10, limit))
  return { warga, kk, mutasi }
}

/* ─── Bulk actions ─── */
export async function bulkUpdateWarga(
  ids: string[],
  patch: Partial<Pick<Warga, 'status' | 'nomorKk'>>,
  actor?: SessionUser,
): Promise<{ updated: number }> {
  await ensureHydrated()
  let updated = 0
  for (const id of ids) {
    const w = store().warga.get(id)
    if (!w) continue
    if (patch.status) w.status = patch.status
    if (patch.nomorKk) w.nomorKk = patch.nomorKk
    w.updatedAt = new Date().toISOString()
    store().warga.set(id, w)
    updated++
  }
  if (actor) addLog(actor.username, `bulk_warga n=${updated}`)
  markDirty()
  return { updated }
}

export async function bulkUpdateKkRt(
  ids: string[],
  rt: string,
  actor?: SessionUser,
): Promise<{ updated: number }> {
  await ensureHydrated()
  let updated = 0
  for (const id of ids) {
    const k = store().keluarga.get(id)
    if (!k) continue
    k.rt = rt
    k.updatedAt = new Date().toISOString()
    store().keluarga.set(id, k)
    updated++
  }
  if (actor) addLog(actor.username, `bulk_kk_rt ${rt} n=${updated}`)
  markDirty()
  return { updated }
}

/* ─── Surat arsip + nomor ─── */
export function nextSuratNomor(jenis: SuratJenis): string {
  const y = new Date().getFullYear()
  const code =
    jenis === 'domisili'
      ? 'DOM'
      : jenis === 'pengantar'
        ? 'PGR'
        : jenis === 'usaha'
          ? 'USH'
          : jenis === 'tidak_mampu'
            ? 'SKTM'
            : 'UMUM'
  const count = Array.from(store().surat.values()).filter((s) => s.nomor.includes(`/${y}`)).length + 1
  return `${String(count).padStart(3, '0')}/${code}/JS/${y}`
}

export function listSurat(opts?: { nik?: string; status?: SuratStatus }): SuratArsip[] {
  let rows = Array.from(store().surat.values())
  if (opts?.nik) rows = rows.filter((s) => s.nik === opts.nik)
  if (opts?.status) rows = rows.filter((s) => s.status === opts.status)
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function findSuratByToken(tokenStr: string): SuratArsip | null {
  for (const s of Array.from(store().surat.values())) {
    if (s.verifyToken === tokenStr) return s
  }
  return null
}

export async function createSuratArsip(
  input: {
    jenis: SuratJenis
    nik: string
    nama: string
    keperluan: string
    nomor?: string
    notes?: string
  },
  actor?: SessionUser,
): Promise<SuratArsip> {
  await ensureHydrated()
  const nomor = input.nomor?.trim() || nextSuratNomor(input.jenis)
  const row: SuratArsip = {
    id: uid('srt'),
    nomor,
    jenis: input.jenis,
    nik: input.nik,
    nama: input.nama,
    keperluan: input.keperluan,
    status: 'terbit',
    verifyToken: token(20),
    createdBy: actor?.username,
    createdAt: new Date().toISOString(),
    notes: input.notes,
  }
  store().surat.set(row.id, row)
  if (actor) addLog(actor.username, `surat_arsip ${row.nomor}`)
  markDirty()
  return row
}

/* ─── Portal warga ─── */
export function listPortal(opts?: { status?: PortalStatus }): PortalPengajuan[] {
  let rows = Array.from(store().portal.values())
  if (opts?.status) rows = rows.filter((p) => p.status === opts.status)
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createPortal(input: {
  jenis: 'surat' | 'update_data'
  nama: string
  nik: string
  noHp?: string
  keperluan: string
  detail?: string
}): Promise<PortalPengajuan> {
  await ensureHydrated()
  const t = new Date().toISOString()
  const row: PortalPengajuan = {
    id: uid('por'),
    jenis: input.jenis,
    nama: input.nama,
    nik: input.nik,
    noHp: input.noHp,
    keperluan: input.keperluan,
    detail: input.detail,
    status: 'menunggu',
    createdAt: t,
    updatedAt: t,
  }
  store().portal.set(row.id, row)
  addLog('portal', `portal_ajukan ${row.jenis} ${maskNik(row.nik)}`)
  markDirty()
  return row
}

export async function updatePortal(
  id: string,
  patch: Partial<Pick<PortalPengajuan, 'status' | 'catatanAdmin'>>,
  actor?: SessionUser,
): Promise<PortalPengajuan | null> {
  await ensureHydrated()
  const row = store().portal.get(id)
  if (!row) return null
  if (patch.status) row.status = patch.status
  if (patch.catatanAdmin !== undefined) row.catatanAdmin = patch.catatanAdmin
  row.updatedAt = new Date().toISOString()
  store().portal.set(id, row)
  if (actor) addLog(actor.username, `portal_${row.status} ${row.id}`)
  markDirty()
  return row
}

/* ─── Backup / restore ─── */
export function exportBackupBundle() {
  const s = store()
  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    mode: dbMode(),
    akun: Array.from(s.akun.values()).map(({ passwordHash: _, ...rest }) => rest),
    keluarga: Array.from(s.keluarga.values()),
    warga: Array.from(s.warga.values()),
    mutasi: Array.from(s.mutasi.values()),
    logs: s.logs.slice(-300),
    master: s.master,
    berita: Array.from(s.berita.values()),
    surat: Array.from(s.surat.values()),
    portal: Array.from(s.portal.values()),
  }
}

export async function importBackupBundle(
  data: {
    keluarga?: Keluarga[]
    warga?: Warga[]
    mutasi?: Mutasi[]
    master?: MasterItem[]
    berita?: Berita[]
    surat?: SuratArsip[]
    portal?: PortalPengajuan[]
  },
  actor?: SessionUser,
  mode: 'merge' | 'replace' = 'merge',
): Promise<{ ok: true; counts: Record<string, number> }> {
  await ensureHydrated()
  const s = store()
  if (mode === 'replace') {
    if (data.keluarga) s.keluarga.clear()
    if (data.warga) s.warga.clear()
    if (data.mutasi) s.mutasi.clear()
    if (data.surat) s.surat.clear()
    if (data.portal) s.portal.clear()
  }
  const counts: Record<string, number> = {}
  if (data.keluarga) {
    for (const k of data.keluarga) s.keluarga.set(k.id, k)
    counts.keluarga = data.keluarga.length
  }
  if (data.warga) {
    for (const w of data.warga) s.warga.set(w.id, w)
    counts.warga = data.warga.length
  }
  if (data.mutasi) {
    for (const m of data.mutasi) s.mutasi.set(m.id, m)
    counts.mutasi = data.mutasi.length
  }
  if (data.master?.length) {
    s.master = data.master
    counts.master = data.master.length
  }
  if (data.berita) {
    for (const b of data.berita) s.berita.set(b.id, b)
    counts.berita = data.berita.length
  }
  if (data.surat) {
    for (const x of data.surat) s.surat.set(x.id, x)
    counts.surat = data.surat.length
  }
  if (data.portal) {
    for (const x of data.portal) s.portal.set(x.id, x)
    counts.portal = data.portal.length
  }
  if (actor) addLog(actor.username, `restore_backup mode=${mode}`)
  markDirty()
  return { ok: true, counts }
}

function countBy(labels: string[]): { label: string; count: number }[] {
  const m = new Map<string, number>()
  for (const l of labels) {
    const key = (l || 'Tidak diisi').trim() || 'Tidak diisi'
    m.set(key, (m.get(key) || 0) + 1)
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
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const sinceIso = since.toISOString().slice(0, 10)
  const recent = mut.filter((m) => m.tanggal >= sinceIso)
  const masukSet = new Set(['masuk', 'lahir', 'pindah_datang'])
  const keluarSet = new Set(['keluar', 'meninggal', 'pindah_keluar'])
  return {
    ...base,
    masuk: countJenis('masuk'),
    keluar: countJenis('keluar'),
    lahir: countJenis('lahir'),
    meninggal: countJenis('meninggal'),
    pindahDatang: countJenis('pindah_datang'),
    pindahKeluar: countJenis('pindah_keluar'),
    mutasiBulanIni: recent.length,
    mutasiMasukBulan: recent.filter((m) => masukSet.has(m.jenis)).length,
    mutasiKeluarBulan: recent.filter((m) => keluarSet.has(m.jenis)).length,
    recentLogs: listLogs(12),
    recentMutasi: listMutasi().slice(0, 12),
    suratPending: listSurat().filter((s) => s.status === 'draft').length,
    portalPending: listPortal({ status: 'menunggu' }).length,
  }
}

/** Map points for RT visualization */
export function mapPoints(scope?: string[] | null) {
  return listKeluarga({ scope })
    .filter((k) => k.latitude && k.longitude)
    .map((k) => ({
      id: k.id,
      nomorKk: k.nomorKk,
      kepala: k.kepalaKeluarga,
      rt: k.rt,
      rw: k.rw,
      alamat: k.alamat,
      lat: Number(k.latitude),
      lng: Number(k.longitude),
      jiwa: listWarga({ nomorKk: k.nomorKk }).filter((w) => w.status === 'aktif').length,
    }))
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
}

export function roleCan(
  role: Role,
  action: 'read' | 'write' | 'mutasi' | 'import' | 'master' | 'users' | 'audit',
): boolean {
  if (role === 'super_admin') return true
  if (role === 'admin') return action !== 'users'
  return action === 'read' || action === 'write'
}
