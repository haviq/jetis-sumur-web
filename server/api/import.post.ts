function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length)
  if (lines.length < 2) return []

  const split = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"'
          i++
        } else q = !q
        continue
      }
      if (ch === ',' && !q) {
        out.push(cur.trim())
        cur = ''
        continue
      }
      cur += ch
    }
    out.push(cur.trim())
    return out
  }

  const headers = split(lines[0]).map((h) =>
    h
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, ''),
  )
  return lines.slice(1).map((line) => {
    const cols = split(line)
    const o: Record<string, string> = {}
    headers.forEach((h, i) => {
      o[h] = cols[i] || ''
    })
    return o
  })
}

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'write')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const body = await readBody<{ type?: string; csv?: string; rows?: Record<string, string>[] }>(event)
  const type = String(body?.type || 'warga')
  let rows = body?.rows
  if ((!rows || !rows.length) && body?.csv) rows = parseCsv(body.csv)
  if (!rows?.length) {
    throw createError({ statusCode: 400, statusMessage: 'empty_csv' })
  }

  if (type === 'kk' || type === 'keluarga') {
    const result = await importKeluargaRows(rows, user)
    return { ok: true, type: 'kk', ...result }
  }

  const result = await importWargaRows(rows, user)
  return { ok: true, type: 'warga', ...result }
})
