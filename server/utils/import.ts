/**
 * Bulk import warga/KK from CSV-like rows.
 */
import type { SessionUser } from './types'
import {
  addLog,
  ensureHydrated,
  findWargaByNik,
  getKeluargaByNomor,
  upsertKeluarga,
  upsertWarga,
  getRwFromRt,
} from './db'

/**
 * Expected headers (flexible): nik,nama,nomor_kk|nomorkk,jk,tanggal_lahir,agama,pendidikan,pekerjaan,hubungan_kk,status
 */
export async function importWargaRows(
  rows: Record<string, string>[],
  actor?: SessionUser,
): Promise<{ created: number; updated: number; errors: string[] }> {
  await ensureHydrated()
  let created = 0
  let updated = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const line = i + 2
    const nik = (r.nik || r.NIK || '').trim()
    const nama = (r.nama || r.Nama || '').trim()
    const nomorKk = (r.nomor_kk || r.nomorkk || r.nomorKk || r.kk || '').trim()
    if (!/^\d{16}$/.test(nik)) {
      errors.push(`baris ${line}: NIK tidak valid`)
      continue
    }
    if (nama.length < 2) {
      errors.push(`baris ${line}: nama kosong`)
      continue
    }
    if (!/^\d{16}$/.test(nomorKk)) {
      errors.push(`baris ${line}: nomor KK tidak valid`)
      continue
    }

    const existing = findWargaByNik(nik)
    const jkRaw = (r.jk || r.jenis_kelamin || 'L').toUpperCase()
    const jk = jkRaw.startsWith('P') ? 'P' : 'L'
    const statusRaw = (r.status || 'aktif').toLowerCase()
    const status =
      statusRaw.includes('meninggal')
        ? 'meninggal'
        : statusRaw.includes('pindah')
          ? 'pindah'
          : statusRaw.includes('non')
            ? 'nonaktif'
            : 'aktif'

    await upsertWarga(
      {
        id: existing?.id,
        nik,
        nomorKk,
        nama,
        tempatLahir: r.tempat_lahir || r.tempatLahir || undefined,
        tanggalLahir: r.tanggal_lahir || r.tgl_lahir || r.tanggalLahir || undefined,
        jk: jk as 'L' | 'P',
        agama: r.agama || undefined,
        pendidikan: r.pendidikan || undefined,
        pekerjaan: r.pekerjaan || undefined,
        statusKawin: r.status_kawin || r.statusKawin || undefined,
        hubunganKk: (r.hubungan_kk || r.hubunganKk || existing?.hubunganKk || 'Lainnya') as any,
        goldar: r.goldar || undefined,
        bpjs: r.bpjs || undefined,
        noHp: r.no_hp || r.noHp || undefined,
        status: status as any,
      },
      actor,
    )
    if (existing) updated++
    else created++
  }

  if (actor) addLog(actor.username, `import_warga +${created}/~${updated} err=${errors.length}`)
  return { created, updated, errors: errors.slice(0, 40) }
}

export async function importKeluargaRows(
  rows: Record<string, string>[],
  actor?: SessionUser,
): Promise<{ created: number; updated: number; errors: string[] }> {
  await ensureHydrated()
  let created = 0
  let updated = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const line = i + 2
    const nomorKk = (r.nomor_kk || r.nomorkk || r.nomorKk || r.kk || '').trim()
    const kepala = (r.kepala_keluarga || r.kepala || r.kepalaKeluarga || '').trim()
    const alamat = (r.alamat || '').trim()
    if (!/^\d{16}$/.test(nomorKk)) {
      errors.push(`baris ${line}: nomor KK tidak valid`)
      continue
    }
    if (kepala.length < 3) {
      errors.push(`baris ${line}: kepala keluarga kosong`)
      continue
    }
    const prev = getKeluargaByNomor(nomorKk)
    const rt = (r.rt || prev?.rt || '01').toString().padStart(2, '0')
    await upsertKeluarga(
      {
        id: prev?.id,
        nomorKk,
        kepalaKeluarga: kepala,
        rt,
        rw: getRwFromRt(rt, r.rw || prev?.rw),
        alamat: alamat || prev?.alamat || '-',
        statusRumah: r.status_rumah || r.statusRumah || undefined,
      },
      actor,
    )
    if (prev) updated++
    else created++
  }

  if (actor) addLog(actor.username, `import_kk +${created}/~${updated} err=${errors.length}`)
  return { created, updated, errors: errors.slice(0, 40) }
}
