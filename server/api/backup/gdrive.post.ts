import { exportBackupBundle, ensureHydrated } from '~/server/utils/db'
import { sessionFromEvent, canAccess } from '~/server/utils/auth'
import { uploadBackupToDrive } from '~/server/utils/google-drive'
import { addLog } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'backup')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()
  const bundle = exportBackupBundle()

  // Ambil folder ID dari env — wajib diset agar upload ke Drive personal, bukan Drive SA
  const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim()
  if (!folderId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GOOGLE_DRIVE_FOLDER_ID belum diset. Share folder Drive ke service account lalu set env ini.',
    })
  }

  const result = await uploadBackupToDrive(bundle, folderId)
  addLog(user.username, 'backup_gdrive', `file: ${result.fileName}`)

  return {
    ok: true,
    fileName: result.fileName,
    fileId: result.fileId,
    url: result.url,
  }
})
