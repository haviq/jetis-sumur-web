// GET /api/push/history — riwayat notifikasi yang pernah dikirim
// Auth: padukuhan minimum

import { listNotifHistory } from './send.post'

export default defineEventHandler((event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  return { items: listNotifHistory() }
})
