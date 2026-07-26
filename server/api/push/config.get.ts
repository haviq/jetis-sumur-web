// GET /api/push/config — status VAPID dan jumlah subscriber
// Auth: padukuhan minimum

import { listPushSubs } from './subscribe.post'

export default defineEventHandler((event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || '').trim()
  const vapidConfigured = !!(vapidPublicKey && (process.env.VAPID_PRIVATE_KEY || '').trim())

  return {
    vapidConfigured,
    vapidPublicKey: vapidConfigured ? vapidPublicKey : '',
    subscribers: listPushSubs().length,
  }
})
