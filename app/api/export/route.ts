import { NextResponse } from 'next/server'
import { requestIsAdmin } from '@/lib/admin-auth'
import { exportFlat, listKk, listWarga } from '@/lib/db'
import { toCsv } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const type = new URL(req.url).searchParams.get('type') || 'flat'

  let csv = ''
  let filename = 'jetis-sumur.csv'

  if (type === 'kk') {
    const rows = listKk()
    csv = toCsv(
      ['id', 'no_kk', 'kepala', 'nik_kk', 'rt', 'rw', 'alamat', 'status', 'telepon'],
      rows.map((r) => [r.id, r.noKk, r.kepalaKeluarga, r.nikKk, r.rt, r.rw, r.alamat, r.status, r.telepon || '']),
    )
    filename = 'kk.csv'
  } else if (type === 'warga') {
    const rows = listWarga()
    csv = toCsv(
      ['id', 'kk_id', 'nik', 'nama', 'jk', 'hubungan', 'status', 'tgl_lahir'],
      rows.map((r) => [r.id, r.kkId, r.nik, r.nama, r.jk, r.hubungan, r.status, r.tglLahir || '']),
    )
    filename = 'warga.csv'
  } else {
    const rows = exportFlat()
    csv = toCsv(
      ['no_kk', 'kepala', 'rt', 'nik', 'nama', 'jk', 'hubungan', 'status'],
      rows.map((r) => [r.noKk, r.kepala, r.rt, r.nik, r.nama, r.jk, r.hubungan, r.status]),
    )
    filename = 'pendataan-flat.csv'
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
