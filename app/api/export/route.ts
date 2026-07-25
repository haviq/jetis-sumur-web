import { NextResponse } from 'next/server'
import { requestIsAdmin } from '@/lib/admin-auth'
import { ensureHydrated, exportFlat, listKk, listWarga, importFlatRows } from '@/lib/db'
import { toCsv } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  await ensureHydrated()
  const type = new URL(req.url).searchParams.get('type') || 'flat'

  let csv = ''
  let filename = 'jetis-sumur.csv'

  if (type === 'kk') {
    const rows = listKk()
    csv = toCsv(
      ['id', 'no_kk', 'kepala', 'nik_kk', 'rt', 'rw', 'alamat', 'status', 'telepon'],
      rows.map((r) => [
        r.id,
        r.noKk,
        r.kepalaKeluarga,
        r.nikKk,
        r.rt,
        r.rw,
        r.alamat,
        r.status,
        r.telepon || '',
      ]),
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
    const rows = await exportFlat()
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

/** Import CSV body: { csv: string } with header no_kk,kepala,rt,nik,nama,jk,hubungan,status */
export async function POST(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  let body: { csv?: string; rows?: Record<string, string>[] } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  let rows: {
    noKk: string
    kepala: string
    rt: string
    nik: string
    nama: string
    jk?: string
    hubungan?: string
    status?: string
    alamat?: string
  }[] = []

  if (Array.isArray(body.rows)) {
    rows = body.rows.map((r) => ({
      noKk: r.no_kk || r.noKk || '',
      kepala: r.kepala || r.kepala_keluarga || '',
      rt: r.rt || '01',
      nik: r.nik || '',
      nama: r.nama || '',
      jk: r.jk,
      hubungan: r.hubungan,
      status: r.status,
      alamat: r.alamat,
    }))
  } else if (body.csv) {
    const lines = body.csv
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length < 2) {
      return NextResponse.json({ ok: false, error: 'empty_csv' }, { status: 400 })
    }
    const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
    for (const line of lines.slice(1)) {
      const cols = splitCsvLine(line)
      const o: Record<string, string> = {}
      headers.forEach((h, i) => {
        o[h] = cols[i] || ''
      })
      rows.push({
        noKk: o.no_kk || o.nokk || '',
        kepala: o.kepala || o.kepala_keluarga || '',
        rt: o.rt || '01',
        nik: o.nik || '',
        nama: o.nama || '',
        jk: o.jk,
        hubungan: o.hubungan,
        status: o.status,
        alamat: o.alamat,
      })
    }
  } else {
    return NextResponse.json({ ok: false, error: 'csv_or_rows_required' }, { status: 400 })
  }

  const result = await importFlatRows(rows)
  return NextResponse.json({ ok: true, imported: result, totalRows: rows.length })
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        inQ = false
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQ = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}
