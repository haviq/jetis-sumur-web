import site from '../../content/site.json'

export function getSite() {
  return site
}

export function isNik(v: string): boolean {
  return /^\d{16}$/.test((v || '').trim())
}

export function isNomorKk(v: string): boolean {
  return /^\d{16}$/.test((v || '').trim())
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
