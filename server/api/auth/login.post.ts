export default defineEventHandler(async (event) => {
  await ensureHydrated()
  const body = await readBody<{ username?: string; password?: string; pin?: string }>(event)

  if (body?.pin && !body.username) {
    const pin = (process.env.ADMIN_PIN || 'jetis2026').trim()
    if (body.pin === pin) {
      const user = {
        id: 'u_admin',
        nama: 'Admin',
        username: 'admin',
        role: 'admin' as const,
      }
      const token = mintSession(user)
      setHeader(event, 'Set-Cookie', cookieHeader(token))
      return { ok: true, user }
    }
    throw createError({ statusCode: 401, statusMessage: 'invalid_pin' })
  }

  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }

  const akun = await findAkunByUsername(username)
  if (!akun || akun.status !== 'aktif' || !verifyPassword(password, akun.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid_credentials' })
  }

  await touchLogin(akun.id)
  addLog(akun.username, 'login')
  const user = {
    id: akun.id,
    nama: akun.nama,
    username: akun.username,
    role: akun.role,
  }
  setHeader(event, 'Set-Cookie', cookieHeader(mintSession(user)))
  return { ok: true, user }
})
