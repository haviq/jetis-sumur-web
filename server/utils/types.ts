/** PRD v2 types — Sistem Pendataan Warga Jetis Sumur */

export type Role = 'super_admin' | 'admin' | 'padukuhan'
export type AccountStatus = 'aktif' | 'nonaktif'
export type JK = 'L' | 'P'
export type WargaStatus = 'aktif' | 'pindah' | 'meninggal' | 'nonaktif' | 'deleted'
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

export type SuratJenis = 'domisili' | 'pengantar' | 'usaha' | 'tidak_mampu' | 'umum'
export type SuratStatus = 'draft' | 'terbit' | 'arsip' | 'dibatalkan'
export type PortalStatus = 'menunggu' | 'diproses' | 'selesai' | 'ditolak'

export interface Akun {
  id: string
  nama: string
  username: string
  passwordHash: string
  role: Role
  status: AccountStatus
  /** Batasi akses data ke RT tertentu (role padukuhan). Kosong = semua RT. */
  rtScope?: string[]
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
  /** Soft-delete compliance */
  deletedAt?: string
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
  /** Human-readable mirror (optional, computed on read if missing) */
  human?: string
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

export interface SuratArsip {
  id: string
  nomor: string
  jenis: SuratJenis
  nik: string
  nama: string
  keperluan: string
  status: SuratStatus
  /** Token untuk QR verifikasi publik */
  verifyToken: string
  createdBy?: string
  createdAt: string
  notes?: string
}

export interface PortalPengajuan {
  id: string
  jenis: 'surat' | 'update_data'
  nama: string
  nik: string
  noHp?: string
  keperluan: string
  detail?: string
  status: PortalStatus
  catatanAdmin?: string
  createdAt: string
  updatedAt: string
}

export interface SessionUser {
  id: string
  nama: string
  username: string
  role: Role
  tenantId?: string
  rtScope?: string[]
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
  perRt: { rt: string; kk: number; jiwa: number }[]
  perRw: { rw: string; kk: number; jiwa: number }[]
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
  /** Mutasi 30 hari terakhir */
  mutasiBulanIni: number
  mutasiMasukBulan: number
  mutasiKeluarBulan: number
  recentLogs: LogAktivitas[]
  recentMutasi: Mutasi[]
  suratPending?: number
  portalPending?: number
}

export interface Kk360 {
  kk: Keluarga
  anggota: Warga[]
  mutasi: Mutasi[]
  surat: SuratArsip[]
  ringkas: {
    jiwa: number
    laki: number
    perempuan: number
    aktif: number
  }
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

export const SURAT_JENIS_LIST: { value: SuratJenis; label: string }[] = [
  { value: 'domisili', label: 'Keterangan Domisili' },
  { value: 'pengantar', label: 'Surat Pengantar' },
  { value: 'usaha', label: 'Keterangan Usaha' },
  { value: 'tidak_mampu', label: 'Keterangan Tidak Mampu' },
  { value: 'umum', label: 'Keterangan Umum' },
]

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  padukuhan: 'Padukuhan',
}

export type AgendaStatus = 'aktif' | 'selesai' | 'batal'

export interface Agenda {
  id: string
  judul: string
  deskripsi?: string
  tanggal: string      // ISO date YYYY-MM-DD
  waktu?: string       // HH:mm
  lokasi?: string
  status: AgendaStatus
  createdBy?: string
  createdAt: string
}
