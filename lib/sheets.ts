/**
 * Google Sheets persistence layer.
 * Hydrates mock memory store from sheets; flushes full tables on write.
 */
import type { KK, Warga, Pengajuan, KKStatus, WargaStatus, JK, Hubungan, PengajuanJenis, PengajuanStatus } from '@/lib/types'
import {
  sheetsConfigured,
  ensureSheetTabs,
  getValues,
  updateValues,
  clearValues,
} from '@/lib/google-auth'

export { sheetsConfigured }

const SHEETS = {
  kk: 'kk',
  warga: 'warga',
  pengajuan: 'pengajuan',
  meta: 'meta',
} as const

const KK_HEADERS = [
  'id',
  'no_kk',
  'kepala_keluarga',
  'nik_kk',
  'rt',
  'rw',
  'alamat',
  'dusun',
  'status',
  'telepon',
  'catatan',
  'created_at',
  'updated_at',
] as const

const WARGA_HEADERS = [
  'id',
  'kk_id',
  'nik',
  'nama',
  'jk',
  'tempat_lahir',
  'tgl_lahir',
  'hubungan',
  'agama',
  'pendidikan',
  'pekerjaan',
  'status_kawin',
  'status',
  'updated_at',
] as const

const PG_HEADERS = [
  'id',
  'jenis',
  'nama_pelapor',
  'telepon',
  'payload_json',
  'status',
  'created_at',
  'reviewed_at',
  'admin_note',
] as const

function cell(row: string[], idx: number): string {
  return String(row[idx] ?? '').trim()
}

function rowsToObjects(values: string[][]): Record<string, string>[] {
  if (values.length < 2) return []
  const headers = values[0].map((h) => String(h).trim().toLowerCase())
  return values.slice(1).filter((r) => r.some((c) => String(c || '').trim())).map((r) => {
    const o: Record<string, string> = {}
    headers.forEach((h, i) => {
      o[h] = cell(r, i)
    })
    return o
  })
}

function mapKk(o: Record<string, string>): KK | null {
  if (!o.id && !o.no_kk) return null
  return {
    id: o.id || `KK-${o.no_kk}`,
    noKk: o.no_kk || '',
    kepalaKeluarga: o.kepala_keluarga || '',
    nikKk: o.nik_kk || '',
    rt: o.rt || '01',
    rw: o.rw || '01',
    alamat: o.alamat || '',
    dusun: o.dusun || 'Jetis Sumur',
    status: (o.status as KKStatus) || 'aktif',
    telepon: o.telepon || undefined,
    catatan: o.catatan || undefined,
    createdAt: o.created_at || new Date().toISOString(),
    updatedAt: o.updated_at || new Date().toISOString(),
  }
}

function mapWarga(o: Record<string, string>): Warga | null {
  if (!o.id && !o.nik) return null
  return {
    id: o.id || `W-${o.nik}`,
    kkId: o.kk_id || '',
    nik: o.nik || '',
    nama: o.nama || '',
    jk: (o.jk as JK) || 'L',
    tempatLahir: o.tempat_lahir || undefined,
    tglLahir: o.tgl_lahir || undefined,
    hubungan: (o.hubungan as Hubungan) || 'Lainnya',
    agama: o.agama || undefined,
    pendidikan: o.pendidikan || undefined,
    pekerjaan: o.pekerjaan || undefined,
    statusKawin: o.status_kawin || undefined,
    status: (o.status as WargaStatus) || 'aktif',
    updatedAt: o.updated_at || new Date().toISOString(),
  }
}

function mapPengajuan(o: Record<string, string>): Pengajuan | null {
  if (!o.id) return null
  let payload: Record<string, unknown> = {}
  try {
    payload = o.payload_json ? JSON.parse(o.payload_json) : {}
  } catch {
    payload = { raw: o.payload_json }
  }
  return {
    id: o.id,
    jenis: (o.jenis as PengajuanJenis) || 'update',
    namaPelapor: o.nama_pelapor || '',
    telepon: o.telepon || undefined,
    payload,
    status: (o.status as PengajuanStatus) || 'pending',
    createdAt: o.created_at || new Date().toISOString(),
    reviewedAt: o.reviewed_at || undefined,
    adminNote: o.admin_note || undefined,
  }
}

export async function loadAllFromSheets(): Promise<{
  kk: KK[]
  warga: Warga[]
  pengajuan: Pengajuan[]
}> {
  await ensureSheetTabs([SHEETS.kk, SHEETS.warga, SHEETS.pengajuan, SHEETS.meta])
  const [kkVals, wargaVals, pgVals] = await Promise.all([
    getValues(`${SHEETS.kk}!A:M`),
    getValues(`${SHEETS.warga}!A:N`),
    getValues(`${SHEETS.pengajuan}!A:I`),
  ])

  // Bootstrap headers if empty
  if (kkVals.length === 0) {
    await updateValues(`${SHEETS.kk}!A1`, [Array.from(KK_HEADERS)])
  }
  if (wargaVals.length === 0) {
    await updateValues(`${SHEETS.warga}!A1`, [Array.from(WARGA_HEADERS)])
  }
  if (pgVals.length === 0) {
    await updateValues(`${SHEETS.pengajuan}!A1`, [Array.from(PG_HEADERS)])
  }

  const kk = rowsToObjects(kkVals.length ? kkVals : [Array.from(KK_HEADERS)])
    .map(mapKk)
    .filter(Boolean) as KK[]
  const warga = rowsToObjects(wargaVals.length ? wargaVals : [Array.from(WARGA_HEADERS)])
    .map(mapWarga)
    .filter(Boolean) as Warga[]
  const pengajuan = rowsToObjects(pgVals.length ? pgVals : [Array.from(PG_HEADERS)])
    .map(mapPengajuan)
    .filter(Boolean) as Pengajuan[]

  return { kk, warga, pengajuan }
}

export async function flushAllToSheets(data: {
  kk: KK[]
  warga: Warga[]
  pengajuan: Pengajuan[]
}): Promise<void> {
  await ensureSheetTabs([SHEETS.kk, SHEETS.warga, SHEETS.pengajuan, SHEETS.meta])

  const kkRows: (string | number)[][] = [
    Array.from(KK_HEADERS),
    ...data.kk.map((r) => [
      r.id,
      r.noKk,
      r.kepalaKeluarga,
      r.nikKk,
      r.rt,
      r.rw,
      r.alamat,
      r.dusun,
      r.status,
      r.telepon || '',
      r.catatan || '',
      r.createdAt,
      r.updatedAt,
    ]),
  ]
  const wargaRows: (string | number)[][] = [
    Array.from(WARGA_HEADERS),
    ...data.warga.map((r) => [
      r.id,
      r.kkId,
      r.nik,
      r.nama,
      r.jk,
      r.tempatLahir || '',
      r.tglLahir || '',
      r.hubungan,
      r.agama || '',
      r.pendidikan || '',
      r.pekerjaan || '',
      r.statusKawin || '',
      r.status,
      r.updatedAt,
    ]),
  ]
  const pgRows: (string | number)[][] = [
    Array.from(PG_HEADERS),
    ...data.pengajuan.map((r) => [
      r.id,
      r.jenis,
      r.namaPelapor,
      r.telepon || '',
      JSON.stringify(r.payload || {}),
      r.status,
      r.createdAt,
      r.reviewedAt || '',
      r.adminNote || '',
    ]),
  ]

  // Clear then write to avoid stale tail rows
  await Promise.all([
    clearValues(`${SHEETS.kk}!A:M`),
    clearValues(`${SHEETS.warga}!A:N`),
    clearValues(`${SHEETS.pengajuan}!A:I`),
  ])
  await Promise.all([
    updateValues(`${SHEETS.kk}!A1`, kkRows),
    updateValues(`${SHEETS.warga}!A1`, wargaRows),
    updateValues(`${SHEETS.pengajuan}!A1`, pgRows),
    updateValues(`${SHEETS.meta}!A1`, [
      ['key', 'value'],
      ['padukuhan', 'Jetis Sumur'],
      ['schema_version', '1'],
      ['last_sync', new Date().toISOString()],
      ['kk_count', data.kk.length],
      ['warga_count', data.warga.length],
    ]),
  ])
}

export async function pingSheets(): Promise<{ ok: boolean; message: string }> {
  if (!sheetsConfigured()) {
    return { ok: false, message: 'Sheets belum dikonfigurasi — memakai database demo (memori).' }
  }
  try {
    await ensureSheetTabs([SHEETS.kk, SHEETS.warga, SHEETS.pengajuan, SHEETS.meta])
    const vals = await getValues(`${SHEETS.meta}!A1:B10`)
    return {
      ok: true,
      message: `Sheets OK · meta rows ${Math.max(0, vals.length - 1)}`,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Sheets error' }
  }
}
