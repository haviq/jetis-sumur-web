import { NextResponse } from 'next/server'
import { requestIsAdmin } from '@/lib/admin-auth'
import { ensureHydrated, getStats, pingSheets, dbMode } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // public-safe subset: mode only without admin
  const isAdmin = requestIsAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({
      ok: true,
      mode: dbMode(),
      admin: false,
    })
  }
  await ensureHydrated()
  const stats = await getStats()
  const sheets = await pingSheets()
  return NextResponse.json({
    ok: true,
    admin: true,
    mode: stats.mode,
    stats,
    sheets,
  })
}
