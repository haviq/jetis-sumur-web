export default defineEventHandler(async (event) => {
  const ip = clientIp(event)
  if (!checkLoginRate(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'too_many_attempts' })
  }

  await ensureHydrated()
  const body = await readBody<{ username?: string; password?: string; pin?: string }>(event)

  // PIN fallback only when explicitly enabled (not for production default)
  const pinLoginEnabled = (process.env.ALLOW_PIN_LOGIN || '').trim() === '1'
  if (pinLoginEnabled && body?.pin && !body.username) {
    const pin = (process.env.ADMIN_PIN || '').trim()
    if (pin && body.pin === pin) {
      const user = {
        id: 'u_admin',
        nama: 'Admin',
        username: 'admin',
        role: 'admin' as const,
        tenantId: resolveTenant({ host: getRequestHeader(event, 'host') }).id,
      }
      setHeader(event, 'Set-Cookie', cookieHeader(mintSession(user)))
      addLog('admin', `login_pin ip=${ip}`)
      return { ok: true, user }
    }
    throw createError({ statusCode: 401, statusMessage: 'invalid_credentials' })
  }

  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }

  const akun = await findAkunByUsername(username)
  if (!akun || akun.status !== 'aktif' || !verifyPassword(password, akun.passwordHash)) {
    addLog(username || 'unknown', `login_fail ip=${ip}`)
    throw createError({ statusCode: 401, statusMessage: 'invalid_credentials' })
  }

  await touchLogin(akun.id)
  const tenant = resolveTenant({ host: getRequestHeader(event, 'host') })
  addLog(akun.username, `login ip=${ip} tenant=${tenant.id}`)
  const user = {
    id: akun.id,
    nama: akun.nama,
    username: akun.username,
    role: akun.role,
    tenantId: tenant.id,
    rtScope: akun.rtScope,
  }
  setHeader(event, 'Set-Cookie', cookieHeader(mintSession(user)))
  return { ok: true, user }
})
