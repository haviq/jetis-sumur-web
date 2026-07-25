/** PRD v2 types — Sistem Pendataan Warga Jetis Sumur */

export type Role = 'super_admin' | 'admin' | 'padukuhan'
export type AccountStatus = 'aktif' | 'nonaktif'
export type JK = 'L' | 'P'
export type WargaStatus = 'aktif' | 'pindah' | 'meninggal' | 'nonaktif'
export type MutasiJenis =
  | 'masuk'
  | 'keluar'
  | 'lahir'
  | 'meninggal'
  | 'pindah_datang'
  | 'pindah_keluar'

export type Hubungan =
  | 'Kepala Keluarga'
  | 'Istri'
  | 'Suami'
  | 'Anak'
  | 'Menantu'
  | 'Cucu'
  | 'Orang Tua'
  | 'Mertua'
  | 'Famili Lain'
  | 'Lainnya'

export interface Akun {
  id: string
  nama: string
  username: string
  passwordHash: string
  role: Role
  status: AccountStatus
  lastLogin?: string
}

export interface Keluarga {
  id: string
  nomorKk: string
  kepalaKeluarga: string
  rt: string
  rw: string
  alamat: string
  latitude?: string
  longitude?: string
  statusRumah?: string
  createdAt: string
  updatedAt: string
}

export interface Warga {
  id: string
  nik: string
  nomorKk: string
  nama: string
  tempatLahir?: string
  tanggalLahir?: string
  jk: JK
  agama?: string
  pendidikan?: string
  pekerjaan?: string
  statusKawin?: string
  hubunganKk: Hubungan
  goldar?: string
  bpjs?: string
  noHp?: string
  disabilitas?: string
  foto?: string
  status: WargaStatus
  createdAt: string
  updatedAt: string
}

export interface Mutasi {
  id: string
  nik: string
  nama?: string
  jenis: MutasiJenis
  tanggal: string
  keterangan?: string
  createdBy?: string
  createdAt: string
}

export interface LogAktivitas {
  id: string
  user: string
  aktivitas: string
  waktu: string
  ip?: string
}

export interface MasterItem {
  id: string
  kategori: 'agama' | 'pendidikan' | 'pekerjaan' | 'rt' | 'rw' | 'status_rumah'
  nilai: string
  urutan: number
}

export interface Berita {
  id: string
  judul: string
  ringkas: string
  isi: string
  tanggal: string
  published: boolean
}

export interface SessionUser {
  id: string
  nama: string
  username: string
  role: Role
  /** Multi-tenant foundation — padukuhan/desa id */
  tenantId?: string
}

export interface PublicStats {
  totalPenduduk: number
  totalKk: number
  laki: number
  perempuan: number
  balita: number
  anak: number
  remaja: number
  dewasa: number
  lansia: number
  perRt: { rt: string; jiwa: number; kk: number }[]
  perRw: { rw: string; jiwa: number; kk: number }[]
  pendidikan: { label: string; count: number }[]
  pekerjaan: { label: string; count: number }[]
  agama: { label: string; count: number }[]
  mode: 'mock' | 'sheets'
}

export interface AdminStats extends PublicStats {
  masuk: number
  keluar: number
  lahir: number
  meninggal: number
  pindahDatang: number
  pindahKeluar: number
  recentLogs: LogAktivitas[]
  recentMutasi: Mutasi[]
}

export const HUBUNGAN_LIST: Hubungan[] = [
  'Kepala Keluarga',
  'Istri',
  'Suami',
  'Anak',
  'Menantu',
  'Cucu',
  'Orang Tua',
  'Mertua',
  'Famili Lain',
  'Lainnya',
]

export const MUTASI_LIST: MutasiJenis[] = [
  'masuk',
  'keluar',
  'lahir',
  'meninggal',
  'pindah_datang',
  'pindah_keluar',
]

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  padukuhan: 'Padukuhan',
}
