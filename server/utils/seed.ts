import { hashPassword } from './auth'
import type { Akun, Berita, Keluarga, MasterItem, Mutasi, Warga } from './types'

const now = () => new Date().toISOString()

export function defaultMaster(): MasterItem[] {
  const rows: MasterItem[] = []
  let i = 0
  const push = (kategori: MasterItem['kategori'], values: string[]) => {
    values.forEach((nilai, urutan) => {
      rows.push({ id: `m_${kategori}_${++i}`, kategori, nilai, urutan })
    })
  }
  push('agama', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'])
  push('pendidikan', [
    'Tidak Sekolah',
    'SD',
    'SMP',
    'SMA/SMK',
    'D1/D2/D3',
    'S1',
    'S2',
    'S3',
  ])
  push('pekerjaan', [
    'Petani',
    'Buruh',
    'Wiraswasta',
    'PNS/ASN',
    'Karyawan Swasta',
    'Ibu Rumah Tangga',
    'Pelajar/Mahasiswa',
    'Pensiunan',
    'Tidak Bekerja',
    'Lainnya',
  ])
  push('rt', ['01', '02', '03', '04'])
  push('rw', ['01'])
  push('status_rumah', ['Milik Sendiri', 'Kontrak', 'Menumpang', 'Lainnya'])
  return rows
}

/**
 * Seed passwords — strong defaults for new installs only.
 * Existing Sheets accounts keep their stored password_hash.
 * Credentials are NOT shown on the public login page.
 */
export function defaultAkun(): Akun[] {
  const superPass = process.env.SEED_SUPER_PASSWORD || 'JsSuper!2026x'
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'JsAdmin!2026x'
  const paduPass = process.env.SEED_PADUKUHAN_PASSWORD || 'JsPadu!2026x'
  return [
    {
      id: 'u_super',
      nama: 'Super Admin',
      username: 'superadmin',
      passwordHash: hashPassword(superPass),
      role: 'super_admin',
      status: 'aktif',
    },
    {
      id: 'u_admin',
      nama: 'Admin Padukuhan',
      username: 'admin',
      passwordHash: hashPassword(adminPass),
      role: 'admin',
      status: 'aktif',
    },
    {
      id: 'u_padukuhan',
      nama: 'Perangkat Padukuhan',
      username: 'padukuhan',
      passwordHash: hashPassword(paduPass),
      role: 'padukuhan',
      status: 'aktif',
    },
  ]
}

export function defaultKeluarga(): Keluarga[] {
  const t = now()
  return [
    {
      id: 'kk_01',
      nomorKk: '3404010101010001',
      kepalaKeluarga: 'Sutrisno',
      rt: '01',
      rw: '01',
      alamat: 'Jetis Sumur RT 01',
      statusRumah: 'Milik Sendiri',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'kk_02',
      nomorKk: '3404010101010002',
      kepalaKeluarga: 'Wagimin',
      rt: '02',
      rw: '01',
      alamat: 'Jetis Sumur RT 02',
      statusRumah: 'Milik Sendiri',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'kk_03',
      nomorKk: '3404010101010003',
      kepalaKeluarga: 'Siti Aminah',
      rt: '03',
      rw: '01',
      alamat: 'Jetis Sumur RT 03',
      statusRumah: 'Menumpang',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'kk_04',
      nomorKk: '3404010101010004',
      kepalaKeluarga: 'Bambang Hartono',
      rt: '04',
      rw: '01',
      alamat: 'Jetis Sumur RT 04',
      statusRumah: 'Milik Sendiri',
      createdAt: t,
      updatedAt: t,
    },
  ]
}

export function defaultWarga(): Warga[] {
  const t = now()
  return [
    {
      id: 'w_01',
      nik: '3404010101800001',
      nomorKk: '3404010101010001',
      nama: 'Sutrisno',
      tempatLahir: 'Sleman',
      tanggalLahir: '1980-01-15',
      jk: 'L',
      agama: 'Islam',
      pendidikan: 'SMA/SMK',
      pekerjaan: 'Petani',
      statusKawin: 'Kawin',
      hubunganKk: 'Kepala Keluarga',
      goldar: 'O',
      bpjs: 'Ya',
      noHp: '081234567001',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_02',
      nik: '3404014501850002',
      nomorKk: '3404010101010001',
      nama: 'Sulastri',
      tempatLahir: 'Sleman',
      tanggalLahir: '1985-05-20',
      jk: 'P',
      agama: 'Islam',
      pendidikan: 'SMP',
      pekerjaan: 'Ibu Rumah Tangga',
      statusKawin: 'Kawin',
      hubunganKk: 'Istri',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_03',
      nik: '3404010101100003',
      nomorKk: '3404010101010001',
      nama: 'Andi Pratama',
      tempatLahir: 'Sleman',
      tanggalLahir: '2010-03-12',
      jk: 'L',
      agama: 'Islam',
      pendidikan: 'SD',
      pekerjaan: 'Pelajar/Mahasiswa',
      statusKawin: 'Belum Kawin',
      hubunganKk: 'Anak',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_04',
      nik: '3404010101750004',
      nomorKk: '3404010101010002',
      nama: 'Wagimin',
      tempatLahir: 'Sleman',
      tanggalLahir: '1975-08-08',
      jk: 'L',
      agama: 'Islam',
      pendidikan: 'SD',
      pekerjaan: 'Buruh',
      statusKawin: 'Kawin',
      hubunganKk: 'Kepala Keluarga',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_05',
      nik: '3404015201780005',
      nomorKk: '3404010101010002',
      nama: 'Marni',
      tempatLahir: 'Sleman',
      tanggalLahir: '1978-11-02',
      jk: 'P',
      agama: 'Islam',
      pendidikan: 'SD',
      pekerjaan: 'Petani',
      statusKawin: 'Kawin',
      hubunganKk: 'Istri',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_06',
      nik: '3404015201600006',
      nomorKk: '3404010101010003',
      nama: 'Siti Aminah',
      tempatLahir: 'Sleman',
      tanggalLahir: '1960-04-18',
      jk: 'P',
      agama: 'Islam',
      pendidikan: 'Tidak Sekolah',
      pekerjaan: 'Tidak Bekerja',
      statusKawin: 'Cerai Mati',
      hubunganKk: 'Kepala Keluarga',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_07',
      nik: '3404010101550007',
      nomorKk: '3404010101010004',
      nama: 'Bambang Hartono',
      tempatLahir: 'Sleman',
      tanggalLahir: '1955-12-01',
      jk: 'L',
      agama: 'Islam',
      pendidikan: 'SMP',
      pekerjaan: 'Pensiunan',
      statusKawin: 'Kawin',
      hubunganKk: 'Kepala Keluarga',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: 'w_08',
      nik: '3404010102180008',
      nomorKk: '3404010101010004',
      nama: 'Rina Dewi',
      tempatLahir: 'Sleman',
      tanggalLahir: '2018-07-22',
      jk: 'P',
      agama: 'Islam',
      pendidikan: 'Tidak Sekolah',
      pekerjaan: 'Tidak Bekerja',
      statusKawin: 'Belum Kawin',
      hubunganKk: 'Cucu',
      status: 'aktif',
      createdAt: t,
      updatedAt: t,
    },
  ]
}

export function defaultMutasi(): Mutasi[] {
  const t = now()
  return [
    {
      id: 'mut_01',
      nik: '3404010102180008',
      nama: 'Rina Dewi',
      jenis: 'lahir',
      tanggal: '2018-07-22',
      keterangan: 'Lahir di Jetis Sumur',
      createdBy: 'system',
      createdAt: t,
    },
  ]
}

export function defaultBerita(): Berita[] {
  return [
    {
      id: 'b_01',
      judul: 'Pendataan warga digital dimulai',
      ringkas: 'Padukuhan Jetis Sumur mulai memakai sistem pendataan berbasis web.',
      isi: 'Perangkat padukuhan mengajak warga melapor koreksi data melalui form resmi. Data pribadi tidak ditampilkan di website publik.',
      tanggal: '2026-07-01',
      published: true,
    },
    {
      id: 'b_02',
      judul: 'Jam layanan balai',
      ringkas: 'Layanan administrasi Senin–Jumat pukul 08.00–14.00 WIB.',
      isi: 'Untuk urusan surat dan pembaruan data, warga dapat datang ke balai pada jam layanan.',
      tanggal: '2026-07-10',
      published: true,
    },
  ]
}
