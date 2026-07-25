export default defineEventHandler((event) => {
  setHeader(event, 'Set-Cookie', clearCookieHeader())
  return { ok: true }
})
