/** Validasi NIK / No.KK + soft-check usia */

export function digitsOnly(v: string): string {
  return String(v || '').replace(/\D/g, '')
}

export function isNik(v: string): boolean {
  return /^\d{16}$/.test(digitsOnly(v))
}

export function isNomorKk(v: string): boolean {
  return /^\d{16}$/.test(digitsOnly(v))
}

/** Parse partial date from NIK positions 7-12 (DDMMYY) — rough check only */
export function nikBirthHint(nik: string): { day: number; month: number; year: number; female: boolean } | null {
  const n = digitsOnly(nik)
  if (n.length !== 16) return null
  let day = Number(n.slice(6, 8))
  const month = Number(n.slice(8, 10))
  let year = Number(n.slice(10, 12))
  const female = day > 40
  if (female) day -= 40
  if (day < 1 || day > 31 || month < 1 || month > 12) return null
  // century guess: YY > current%100 → 1900s else 2000s (common civic heuristic)
  const nowY = new Date().getFullYear() % 100
  year += year > nowY + 1 ? 1900 : 2000
  return { day, month, year, female }
}

export function ageFromIso(tgl?: string): number | null {
  if (!tgl || !/^\d{4}-\d{2}-\d{2}/.test(tgl)) return null
  const d = new Date(tgl)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age >= 0 && age < 130 ? age : null
}

export type NikCheck = {
  ok: boolean
  nik: string
  errors: string[]
  warnings: string[]
  hint?: ReturnType<typeof nikBirthHint>
}

export function validateNik(
  raw: string,
  opts?: { tanggalLahir?: string; jk?: 'L' | 'P'; existingOtherId?: boolean },
): NikCheck {
  const nik = digitsOnly(raw)
  const errors: string[] = []
  const warnings: string[] = []
  if (nik.length !== 16) errors.push('NIK harus 16 digit angka')
  if (opts?.existingOtherId) errors.push('NIK sudah terdaftar pada warga lain')

  const hint = nik.length === 16 ? nikBirthHint(nik) : null
  if (nik.length === 16 && !hint) warnings.push('Pola tanggal lahir di NIK tidak standar (boleh dilanjutkan)')

  if (hint && opts?.jk) {
    if (opts.jk === 'P' && !hint.female) warnings.push('Digit tgl NIK biasanya >40 untuk perempuan')
    if (opts.jk === 'L' && hint.female) warnings.push('Digit tgl NIK biasanya ≤40 untuk laki-laki')
  }

  if (hint && opts?.tanggalLahir && /^\d{4}-\d{2}-\d{2}/.test(opts.tanggalLahir)) {
    const [y, m, d] = opts.tanggalLahir.split('-').map(Number)
    if (y !== hint.year || m !== hint.month || d !== hint.day) {
      warnings.push('Tanggal lahir tidak cocok dengan digit NIK (soft-check)')
    }
  }

  const age = ageFromIso(opts?.tanggalLahir)
  if (age != null && (age < 0 || age > 120)) errors.push('Tanggal lahir di luar rentang wajar')

  return { ok: errors.length === 0, nik, errors, warnings, hint: hint || undefined }
}

export function maskNik(nik: string): string {
  const n = digitsOnly(nik)
  if (n.length < 8) return '****'
  return `${n.slice(0, 4)}****${n.slice(-4)}`
}

export function maskName(nama: string): string {
  const p = String(nama || '').trim().split(/\s+/)
  if (!p.length) return '***'
  if (p.length === 1) return p[0].slice(0, 1) + '***'
  return `${p[0]} ${p[p.length - 1].slice(0, 1)}.`
}

/** Humanize raw log activity codes */
export function humanizeAktivitas(raw: string): string {
  const s = String(raw || '')
  const map: [RegExp, string][] = [
    [/^upsert_kk\s+(.+)/i, 'Memperbarui Kartu Keluarga $1'],
    [/^delete_kk\s+(.+)/i, 'Menghapus Kartu Keluarga $1'],
    [/^upsert_warga\s+(.+)/i, 'Memperbarui data warga NIK $1'],
    [/^delete_warga\s+(.+)/i, 'Menghapus (soft) warga $1'],
    [/^restore_warga\s+(.+)/i, 'Memulihkan warga $1'],
    [/^add_mutasi\s+(.+)/i, 'Mencatat mutasi $1'],
    [/^print_surat\s+(.+)/i, 'Mencetak surat untuk NIK $1'],
    [/^print_warga.*/i, 'Mencetak daftar warga'],
    [/^print_rekap.*/i, 'Mencetak rekap pejabat'],
    [/^import_warga.*/i, 'Import data warga'],
    [/^import_kk.*/i, 'Import data KK'],
    [/^backup.*/i, 'Backup data sistem'],
    [/^restore_backup.*/i, 'Restore backup'],
    [/^bulk_.+/i, 'Aksi massal data'],
    [/^surat_arsip\s+(.+)/i, 'Mengarsipkan surat $1'],
    [/^portal_ajukan\s+(.+)/i, 'Pengajuan portal: $1'],
    [/^login$/i, 'Masuk ke sistem'],
  ]
  for (const [re, out] of map) {
    if (re.test(s)) return s.replace(re, out)
  }
  return s.replace(/_/g, ' ')
}
