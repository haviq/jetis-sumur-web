import { listWarga, listKeluarga } from '../../utils/db'
import type { Keluarga, Warga } from '../../utils/types'

export default defineEventHandler(async (event) => {
  const user = sessionFromEvent(event)
  if (!user || !canAccess(user.role, 'read')) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  await ensureHydrated()

  const warga = listWarga({ includeDeleted: false })
  const keluarga = listKeluarga()

  const kkSet = new Set(keluarga.map((k) => k.nomorKk))
  const nikCounts = new Map<string, number>()
  const kkCounts = new Map<string, number>()

  // Hitung jumlah NIK & KK untuk deteksi duplikasi
  for (const w of warga) {
    if (w.nik) nikCounts.set(w.nik, (nikCounts.get(w.nik) || 0) + 1)
  }
  for (const k of keluarga) {
    if (k.nomorKk) kkCounts.set(k.nomorKk, (kkCounts.get(k.nomorKk) || 0) + 1)
  }

  // Hitung jumlah jiwa per KK
  const jiwaPerKk = new Map<string, number>()
  for (const w of warga) {
    jiwaPerKk.set(w.nomorKk, (jiwaPerKk.get(w.nomorKk) || 0) + 1)
  }

  const anomalies: {
    type: 'nik_invalid' | 'nik_duplicate' | 'kk_invalid' | 'kk_duplicate' | 'warga_tanpa_kk' | 'kk_kosong' | 'umur_janggal'
    severity: 'high' | 'medium'
    message: string
    refId: string // NIK, No KK, atau ID
    meta?: any
  }[] = []

  // 1. Cek Warga
  for (const w of warga) {
    // NIK length check
    if (w.nik.length !== 16 || !/^\d+$/.test(w.nik)) {
      anomalies.push({
        type: 'nik_invalid',
        severity: 'high',
        message: `NIK atas nama ${w.nama} tidak valid (harus 16 digit angka)`,
        refId: w.nik,
      })
    }

    // NIK duplicate check
    if ((nikCounts.get(w.nik) || 0) > 1) {
      anomalies.push({
        type: 'nik_duplicate',
        severity: 'high',
        message: `NIK ganda terdeteksi untuk ${w.nama}`,
        refId: w.nik,
      })
    }

    // Warga tanpa KK check
    if (!kkSet.has(w.nomorKk)) {
      anomalies.push({
        type: 'warga_tanpa_kk',
        severity: 'high',
        message: `Warga ${w.nama} memiliki nomor KK yang tidak terdaftar di daftar Keluarga`,
        refId: w.nomorKk,
        meta: { nama: w.nama, id: w.id },
      })
    }

    // Umur janggal check
    if (w.tanggalLahir) {
      const birthYear = new Date(w.tanggalLahir).getFullYear()
      const currentYear = new Date().getFullYear()
      const age = currentYear - birthYear
      if (age < 0 || age > 115) {
        anomalies.push({
          type: 'umur_janggal',
          severity: 'medium',
          message: `Umur ${w.nama} tidak wajar (${age} tahun)`,
          refId: w.nik,
          meta: { nama: w.nama, tgl: w.tanggalLahir },
        })
      }
    }
  }

  // 2. Cek Keluarga
  for (const k of keluarga) {
    // KK length check
    if (k.nomorKk.length !== 16 || !/^\d+$/.test(k.nomorKk)) {
      anomalies.push({
        type: 'kk_invalid',
        severity: 'high',
        message: `Nomor KK Kepala Keluarga ${k.kepalaKeluarga} tidak valid (harus 16 digit angka)`,
        refId: k.nomorKk,
      })
    }

    // KK duplicate check
    if ((kkCounts.get(k.nomorKk) || 0) > 1) {
      anomalies.push({
        type: 'kk_duplicate',
        severity: 'high',
        message: `Nomor KK ganda terdeteksi untuk kepala keluarga ${k.kepalaKeluarga}`,
        refId: k.nomorKk,
      })
    }

    // KK kosong (tanpa warga) check
    if (!jiwaPerKk.has(k.nomorKk)) {
      anomalies.push({
        type: 'kk_kosong',
        severity: 'medium',
        message: `KK ${k.kepalaKeluarga} terdaftar namun tidak memiliki anggota keluarga (jiwa)`,
        refId: k.nomorKk,
      })
    }
  }

  return {
    ok: true,
    totalAnomalies: anomalies.length,
    items: anomalies,
  }
})
