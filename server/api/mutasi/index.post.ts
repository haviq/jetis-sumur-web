import { MUTASI_LIST } from '../../utils/types'

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const nik = String(body.nik || '').trim()
  const jenis = String(body.jenis || '') as any
  const tanggal = String(body.tanggal || '').trim()
  if (!nik || !MUTASI_LIST.includes(jenis) || !tanggal) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_payload' })
  }
  const item = await addMutasi(
    {
      nik,
      nama: body.nama ? String(body.nama) : undefined,
      jenis,
      tanggal,
      keterangan: body.keterangan ? String(body.keterangan) : undefined,
    },
    user,
  )
  return { ok: true, item }
})
