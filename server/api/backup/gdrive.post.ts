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

  const result = await uploadBackupToDrive(bundle)
  addLog(user.username, 'backup_gdrive', `file: ${result.fileName}`)

  return {
    ok: true,
    fileName: result.fileName,
    fileId: result.fileId,
    url: result.url,
  }
})
