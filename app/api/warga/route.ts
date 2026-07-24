import { NextResponse } from 'next/server'
import { requestIsAdmin } from '@/lib/admin-auth'
import { getKk, listWargaByKk, upsertWarga, deleteWarga } from '@/lib/db'
import { isNik } from '@/lib/utils'
import type { JK, Hubungan, WargaStatus } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const id = new URL(req.url).searchParams.get('id') || ''
  const kk = getKk(id)
  if (!kk) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  return NextResponse.json({
    ok: true,
    kk,
    warga: listWargaByKk(id),
  })
}

export async function POST(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (body.action === 'delete') {
    return NextResponse.json({ ok: deleteWarga(String(body.id || '')) })
  }

  const kkId = String(body.kkId || '')
  const nik = String(body.nik || '').trim()
  const nama = String(body.nama || '').trim()
  if (!kkId || !isNik(nik) || nama.length < 3) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  const row = upsertWarga({
    id: body.id ? String(body.id) : undefined,
    kkId,
    nik,
    nama,
    jk: (String(body.jk || 'L') as JK) || 'L',
    tempatLahir: body.tempatLahir ? String(body.tempatLahir) : undefined,
    tglLahir: body.tglLahir ? String(body.tglLahir) : undefined,
    hubungan: (String(body.hubungan || 'Lainnya') as Hubungan) || 'Lainnya',
    agama: body.agama ? String(body.agama) : undefined,
    pendidikan: body.pendidikan ? String(body.pendidikan) : undefined,
    pekerjaan: body.pekerjaan ? String(body.pekerjaan) : undefined,
    statusKawin: body.statusKawin ? String(body.statusKawin) : undefined,
    status: (String(body.status || 'aktif') as WargaStatus) || 'aktif',
  })
  return NextResponse.json({ ok: true, item: row })
}
