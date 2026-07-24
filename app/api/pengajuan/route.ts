import { NextResponse } from 'next/server'
import { createPengajuan, listPengajuan, reviewPengajuan } from '@/lib/db'
import { requestIsAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!requestIsAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, items: listPengajuan() })
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // Admin review
  if (body.action === 'review') {
    if (!requestIsAdmin(req)) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    const status = body.status === 'approved' ? 'approved' : 'rejected'
    const item = reviewPengajuan(String(body.id || ''), status, body.adminNote ? String(body.adminNote) : undefined)
    if (!item) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    return NextResponse.json({ ok: true, item })
  }

  // Public create
  const namaPelapor = String(body.namaPelapor || '').trim()
  const payload = (body.payload && typeof body.payload === 'object' ? body.payload : {}) as Record<
    string,
    unknown
  >
  if (namaPelapor.length < 3) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }
  const item = createPengajuan({
    jenis: body.jenis === 'baru' ? 'baru' : 'update',
    namaPelapor,
    telepon: body.telepon ? String(body.telepon) : undefined,
    payload,
  })
  return NextResponse.json({ ok: true, item }, { status: 201 })
}
