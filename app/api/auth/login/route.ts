import { NextResponse } from 'next/server'
import {
  cookieHeader,
  clearCookieHeader,
  getAdminPin,
  isPinFromEnv,
  mintToken,
  requestIsAdmin,
  secretsEqual,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      admin: requestIsAdmin(req),
      pinFromEnv: isPinFromEnv(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: Request) {
  let body: { pin?: string; action?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (body.action === 'logout') {
    return NextResponse.json(
      { ok: true, admin: false },
      { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': clearCookieHeader() } },
    )
  }

  const pin = String(body.pin || '').trim()
  if (pin.length < 4 || !secretsEqual(pin, getAdminPin())) {
    return NextResponse.json({ ok: false, error: 'invalid_pin' }, { status: 401 })
  }

  return NextResponse.json(
    { ok: true, admin: true },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': cookieHeader(mintToken()),
      },
    },
  )
}
