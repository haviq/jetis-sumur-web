import site from '@/content/site.json'

export function getSite() {
  return site
}

export function maskNik(nik: string): string {
  const d = (nik || '').replace(/\D/g, '')
  if (d.length < 8) return '****'
  return `${d.slice(0, 4)}********${d.slice(-4)}`
}

export function isNik(n: string): boolean {
  return /^\d{16}$/.test((n || '').trim())
}

export function csvEscape(v: string | number | undefined | null): string {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsv(headers: string[], rows: (string | number | undefined | null)[][]): string {
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(r.map(csvEscape).join(','))
  }
  return lines.join('\n')
}
