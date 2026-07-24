import { NextResponse } from 'next/server'
import { requestIsAdmin } from '@/lib/admin-auth'
import { getStats, listKk, listPengajuan, listWarga, upsertKk, deleteKk } from '@/lib/db'
import { isNik } from '@/lib/utils'
import type { KKStatus } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const kind = url.searchParams.get('kind') || 'kk'
  const q = url.searchParams.get('q') || undefined
  const rt = url.searchParams.get('rt') || undefined
  const status = (url.searchParams.get('status') || undefined) as KKStatus | undefined

  if (kind === 'stats') {
    return NextResponse.json({ ok: true, stats: getStats() }, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (kind === 'warga') {
    return NextResponse.json(
      { ok: true, items: listWarga({ q }) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
  if (kind === 'pengajuan') {
    return NextResponse.json(
      { ok: true, items: listPengajuan() },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
  return NextResponse.json(
    { ok: true, items: listKk({ q, rt, status }) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
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

  const action = String(body.action || 'upsert_kk')

  if (action === 'delete_kk') {
    const id = String(body.id || '')
    const ok = deleteKk(id)
    return NextResponse.json({ ok })
  }

  if (action === 'upsert_kk') {
    const noKk = String(body.noKk || '').trim()
    const kepalaKeluarga = String(body.kepalaKeluarga || '').trim()
    const nikKk = String(body.nikKk || '').trim()
    const rt = String(body.rt || '01')
    const alamat = String(body.alamat || '').trim()
    if (!isNik(noKk) || !isNik(nikKk) || kepalaKeluarga.length < 3 || alamat.length < 3) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }
    const row = upsertKk({
      id: body.id ? String(body.id) : undefined,
      noKk,
      kepalaKeluarga,
      nikKk,
      rt,
      rw: String(body.rw || '01'),
      alamat,
      dusun: String(body.dusun || 'Jetis Sumur'),
      status: (String(body.status || 'aktif') as KKStatus) || 'aktif',
      telepon: body.telepon ? String(body.telepon) : undefined,
      catatan: body.catatan ? String(body.catatan) : undefined,
    })
    return NextResponse.json({ ok: true, item: row })
  }

  return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 })
}
