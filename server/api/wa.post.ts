export default defineEventHandler(async (event) => {
  // WA notification hook — returns wa.me deep link (no paid API required)
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<{
    to?: string
    message?: string
    kind?: string
  }>(event)

  const host = getRequestHeader(event, 'host')
  const tenant = resolveTenant({ host, tenantId: user.tenantId })
  const target = String(body?.to || tenant.whatsapp || '')
    .replace(/\D/g, '')
    .replace(/^0/, '62')
  const msg =
    body?.message ||
    `[${tenant.shortName}] Notifikasi sistem pendataan warga. Kind=${body?.kind || 'info'}`

  if (!target) {
    return {
      ok: false,
      statusMessage: 'whatsapp_not_configured',
      hint: 'Isi nomor WhatsApp di tenant / site.json',
    }
  }

  const url = `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
  addLog(user.username, `wa_hook ${body?.kind || 'info'}`)
  return { ok: true, url, to: target, message: msg }
})
