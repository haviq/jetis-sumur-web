/**
 * Google Sheets adapter — PRD tabs:
 * akun, keluarga, warga, mutasi, log_aktivitas, master, berita
 */
import { sheetsConfigured, sheetsEnv, sheetsFetch, ensureSheetTabs } from './google-auth'
import type {
  Akun,
  Berita,
  Keluarga,
  LogAktivitas,
  MasterItem,
  Mutasi,
  Warga,
} from './types'

export type SheetBundle = {
  akun: Akun[]
  keluarga: Keluarga[]
  warga: Warga[]
  mutasi: Mutasi[]
  logs: LogAktivitas[]
  master: MasterItem[]
  berita: Berita[]
}

const AKUN_H = ['id', 'nama', 'username', 'password_hash', 'role', 'status', 'last_login'] as const
const KEL_H = [
  'id',
  'nomor_kk',
  'kepala_keluarga',
  'rt',
  'rw',
  'alamat',
  'latitude',
  'longitude',
  'status_rumah',
  'created_at',
  'updated_at',
] as const
const WARGA_H = [
  'id',
  'nik',
  'nomor_kk',
  'nama',
  'tempat_lahir',
  'tanggal_lahir',
  'jk',
  'agama',
  'pendidikan',
  'pekerjaan',
  'status_kawin',
  'hubungan_kk',
  'goldar',
  'bpjs',
  'no_hp',
  'disabilitas',
  'foto',
  'status',
  'created_at',
  'updated_at',
] as const
const MUT_H = ['id', 'nik', 'nama', 'jenis', 'tanggal', 'keterangan', 'created_by', 'created_at'] as const
const LOG_H = ['id', 'user', 'aktivitas', 'waktu', 'ip'] as const
const MASTER_H = ['id', 'kategori', 'nilai', 'urutan'] as const
const BERITA_H = ['id', 'judul', 'ringkas', 'isi', 'tanggal', 'published'] as const

function cell(row: string[], idx: number): string {
  return String(row[idx] ?? '').trim()
}

function rowsToObjects(values: string[][]): Record<string, string>[] {
  if (values.length < 2) return []
  const headers = values[0].map((h) => String(h).trim().toLowerCase())
  return values
    .slice(1)
    .filter((r) => r.some((c) => String(c || '').trim()))
    .map((r) => {
      const o: Record<string, string> = {}
      headers.forEach((h, i) => {
        o[h] = cell(r, i)
      })
      return o
    })
}

async function getRange(range: string): Promise<string[][]> {
  const { spreadsheetId } = sheetsEnv()
  const enc = encodeURIComponent(range)
  const res = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${enc}`,
  )
  if (!res.ok) throw new Error(`sheets_get ${range}: ${res.status}`)
  const j = (await res.json()) as { values?: string[][] }
  return j.values || []
}

async function putRange(range: string, values: string[][]): Promise<void> {
  const { spreadsheetId } = sheetsEnv()
  const enc = encodeURIComponent(range)
  const res = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${enc}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    },
  )
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`sheets_put ${range}: ${res.status} ${t.slice(0, 200)}`)
  }
}

function parseAkun(o: Record<string, string>): Akun | null {
  if (!o.id || !o.username) return null
  return {
    id: o.id,
    nama: o.nama || o.username,
    username: o.username,
    passwordHash: o.password_hash || '',
    role: (o.role as Akun['role']) || 'padukuhan',
    status: (o.status as Akun['status']) || 'aktif',
    lastLogin: o.last_login || undefined,
  }
}

function parseKeluarga(o: Record<string, string>): Keluarga | null {
  if (!o.id || !o.nomor_kk) return null
  return {
    id: o.id,
    nomorKk: o.nomor_kk,
    kepalaKeluarga: o.kepala_keluarga || '',
    rt: o.rt || '01',
    rw: o.rw || '01',
    alamat: o.alamat || '',
    latitude: o.latitude || undefined,
    longitude: o.longitude || undefined,
    statusRumah: o.status_rumah || undefined,
    createdAt: o.created_at || new Date().toISOString(),
    updatedAt: o.updated_at || new Date().toISOString(),
  }
}

function parseWarga(o: Record<string, string>): Warga | null {
  if (!o.id || !o.nik) return null
  return {
    id: o.id,
    nik: o.nik,
    nomorKk: o.nomor_kk || '',
    nama: o.nama || '',
    tempatLahir: o.tempat_lahir || undefined,
    tanggalLahir: o.tanggal_lahir || undefined,
    jk: o.jk === 'P' ? 'P' : 'L',
    agama: o.agama || undefined,
    pendidikan: o.pendidikan || undefined,
    pekerjaan: o.pekerjaan || undefined,
    statusKawin: o.status_kawin || undefined,
    hubunganKk: (o.hubungan_kk as Warga['hubunganKk']) || 'Lainnya',
    goldar: o.goldar || undefined,
    bpjs: o.bpjs || undefined,
    noHp: o.no_hp || undefined,
    disabilitas: o.disabilitas || undefined,
    foto: o.foto || undefined,
    status: (o.status as Warga['status']) || 'aktif',
    createdAt: o.created_at || new Date().toISOString(),
    updatedAt: o.updated_at || new Date().toISOString(),
  }
}

function parseMutasi(o: Record<string, string>): Mutasi | null {
  if (!o.id) return null
  return {
    id: o.id,
    nik: o.nik || '',
    nama: o.nama || undefined,
    jenis: (o.jenis as Mutasi['jenis']) || 'masuk',
    tanggal: o.tanggal || '',
    keterangan: o.keterangan || undefined,
    createdBy: o.created_by || undefined,
    createdAt: o.created_at || new Date().toISOString(),
  }
}

function parseLog(o: Record<string, string>): LogAktivitas | null {
  if (!o.id) return null
  return {
    id: o.id,
    user: o.user || '',
    aktivitas: o.aktivitas || '',
    waktu: o.waktu || '',
    ip: o.ip || undefined,
  }
}

function parseMaster(o: Record<string, string>): MasterItem | null {
  if (!o.id || !o.kategori) return null
  return {
    id: o.id,
    kategori: o.kategori as MasterItem['kategori'],
    nilai: o.nilai || '',
    urutan: Number(o.urutan || 0),
  }
}

function parseBerita(o: Record<string, string>): Berita | null {
  if (!o.id) return null
  return {
    id: o.id,
    judul: o.judul || '',
    ringkas: o.ringkas || '',
    isi: o.isi || '',
    tanggal: o.tanggal || '',
    published: o.published === '1' || o.published === 'true' || o.published === 'ya',
  }
}

export async function loadFromSheets(): Promise<SheetBundle> {
  if (!sheetsConfigured()) throw new Error('sheets_not_configured')
  await ensureSheetTabs([
    'akun',
    'keluarga',
    'warga',
    'mutasi',
    'log_aktivitas',
    'master',
    'berita',
  ])
  const [akunV, kelV, wargaV, mutV, logV, masterV, beritaV] = await Promise.all([
    getRange('akun!A:G').catch(() => [] as string[][]),
    getRange('keluarga!A:K').catch(() => [] as string[][]),
    getRange('warga!A:T').catch(() => [] as string[][]),
    getRange('mutasi!A:H').catch(() => [] as string[][]),
    getRange('log_aktivitas!A:E').catch(() => [] as string[][]),
    getRange('master!A:D').catch(() => [] as string[][]),
    getRange('berita!A:F').catch(() => [] as string[][]),
  ])

  return {
    akun: rowsToObjects(akunV).map(parseAkun).filter(Boolean) as Akun[],
    keluarga: rowsToObjects(kelV).map(parseKeluarga).filter(Boolean) as Keluarga[],
    warga: rowsToObjects(wargaV).map(parseWarga).filter(Boolean) as Warga[],
    mutasi: rowsToObjects(mutV).map(parseMutasi).filter(Boolean) as Mutasi[],
    logs: rowsToObjects(logV).map(parseLog).filter(Boolean) as LogAktivitas[],
    master: rowsToObjects(masterV).map(parseMaster).filter(Boolean) as MasterItem[],
    berita: rowsToObjects(beritaV).map(parseBerita).filter(Boolean) as Berita[],
  }
}

export async function saveToSheets(b: SheetBundle): Promise<void> {
  if (!sheetsConfigured()) throw new Error('sheets_not_configured')
  await ensureSheetTabs([
    'akun',
    'keluarga',
    'warga',
    'mutasi',
    'log_aktivitas',
    'master',
    'berita',
  ])
  const akunRows: string[][] = [
    [...AKUN_H],
    ...b.akun.map((a) => [
      a.id,
      a.nama,
      a.username,
      a.passwordHash,
      a.role,
      a.status,
      a.lastLogin || '',
    ]),
  ]
  const kelRows: string[][] = [
    [...KEL_H],
    ...b.keluarga.map((k) => [
      k.id,
      k.nomorKk,
      k.kepalaKeluarga,
      k.rt,
      k.rw,
      k.alamat,
      k.latitude || '',
      k.longitude || '',
      k.statusRumah || '',
      k.createdAt,
      k.updatedAt,
    ]),
  ]
  const wargaRows: string[][] = [
    [...WARGA_H],
    ...b.warga.map((w) => [
      w.id,
      w.nik,
      w.nomorKk,
      w.nama,
      w.tempatLahir || '',
      w.tanggalLahir || '',
      w.jk,
      w.agama || '',
      w.pendidikan || '',
      w.pekerjaan || '',
      w.statusKawin || '',
      w.hubunganKk,
      w.goldar || '',
      w.bpjs || '',
      w.noHp || '',
      w.disabilitas || '',
      w.foto || '',
      w.status,
      w.createdAt,
      w.updatedAt,
    ]),
  ]
  const mutRows: string[][] = [
    [...MUT_H],
    ...b.mutasi.map((m) => [
      m.id,
      m.nik,
      m.nama || '',
      m.jenis,
      m.tanggal,
      m.keterangan || '',
      m.createdBy || '',
      m.createdAt,
    ]),
  ]
  const logRows: string[][] = [
    [...LOG_H],
    ...b.logs.slice(-500).map((l) => [l.id, l.user, l.aktivitas, l.waktu, l.ip || '']),
  ]
  const masterRows: string[][] = [
    [...MASTER_H],
    ...b.master.map((m) => [m.id, m.kategori, m.nilai, String(m.urutan)]),
  ]
  const beritaRows: string[][] = [
    [...BERITA_H],
    ...b.berita.map((x) => [
      x.id,
      x.judul,
      x.ringkas,
      x.isi,
      x.tanggal,
      x.published ? 'true' : 'false',
    ]),
  ]

  await Promise.all([
    putRange('akun!A1', akunRows),
    putRange('keluarga!A1', kelRows),
    putRange('warga!A1', wargaRows),
    putRange('mutasi!A1', mutRows),
    putRange('log_aktivitas!A1', logRows),
    putRange('master!A1', masterRows),
    putRange('berita!A1', beritaRows),
  ])
}

export function sheetsModeLabel(): 'mock' | 'sheets' {
  return sheetsConfigured() ? 'sheets' : 'mock'
}
