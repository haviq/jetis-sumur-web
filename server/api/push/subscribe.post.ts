// POST /api/push/subscribe — simpan PushSubscription ke in-memory store
// Auth: padukuhan minimum (semua role ops)

type PushSub = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  savedAt: string
  username: string
}

// In-memory store — cukup untuk MVP, reset on server restart
const g = globalThis as unknown as { __pushSubs?: Map<string, PushSub> }
function subStore(): Map<string, PushSub> {
  if (!g.__pushSubs) g.__pushSubs = new Map()
  return g.__pushSubs
}

export function listPushSubs(): PushSub[] {
  return Array.from(subStore().values())
}

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const body = await readBody<{ subscription?: any; action?: string }>(event)

  // unsubscribe action
  if (body?.action === 'unsubscribe' && body?.subscription?.endpoint) {
    subStore().delete(body.subscription.endpoint)
    addLog(user.username, 'push_unsubscribe')
    return { ok: true, action: 'unsubscribed' }
  }

  const sub = body?.subscription
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    throw createError({ statusCode: 400, statusMessage: 'subscription tidak valid' })
  }

  subStore().set(sub.endpoint, {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    savedAt: new Date().toISOString(),
    username: user.username,
  })

  addLog(user.username, 'push_subscribe')
  return { ok: true, action: 'subscribed', total: subStore().size }
})
