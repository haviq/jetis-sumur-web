import site from '../../content/site.json'

export function getSite() {
  return site
}

export function csvEscape(v: string | number | undefined | null): string {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(r.map(csvEscape).join(','))
  return lines.join('\n')
}

export function parseCsvText(text: string): Record<string, string>[] {
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
