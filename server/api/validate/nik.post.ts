export default defineEventHandler(async (event) => {
  const body = await readBody<{ nik?: string; tanggalLahir?: string; jk?: string; id?: string }>(event)
  const nik = String(body?.nik || '')
  await ensureHydrated()
  const existing = findWargaByNik(nik.replace(/\D/g, ''))
  const other = existing && existing.id !== body?.id
  const check = validateNik(nik, {
    tanggalLahir: body?.tanggalLahir,
    jk: body?.jk === 'P' ? 'P' : body?.jk === 'L' ? 'L' : undefined,
    existingOtherId: Boolean(other),
  })
  return { ok: check.ok, ...check, duplicate: Boolean(other) }
})
