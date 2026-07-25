export type JK = 'L' | 'P'
export type KKStatus = 'aktif' | 'pindah' | 'nonaktif'
export type WargaStatus = 'aktif' | 'pindah' | 'meninggal'
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

export type PengajuanStatus = 'pending' | 'approved' | 'rejected'
export type PengajuanJenis = 'baru' | 'update'

export interface KK {
  id: string
  noKk: string
  kepalaKeluarga: string
  nikKk: string
  rt: string
  rw: string
  alamat: string
  dusun: string
  status: KKStatus
  telepon?: string
  catatan?: string
  createdAt: string
  updatedAt: string
}

export interface Warga {
  id: string
  kkId: string
  nik: string
  nama: string
  jk: JK
  tempatLahir?: string
  tglLahir?: string
  hubungan: Hubungan
  agama?: string
  pendidikan?: string
  pekerjaan?: string
  statusKawin?: string
  status: WargaStatus
  updatedAt: string
}

export interface Pengajuan {
  id: string
  jenis: PengajuanJenis
  namaPelapor: string
  telepon?: string
  payload: Record<string, unknown>
  status: PengajuanStatus
  createdAt: string
  reviewedAt?: string
  adminNote?: string
}

export interface Stats {
  totalKk: number
  totalJiwa: number
  laki: number
  perempuan: number
  perRt: { rt: string; kk: number; jiwa: number }[]
  pendingPengajuan: number
  mode: 'mock' | 'sheets'
  /** Demografi usia kasar dari tglLahir (aktif saja) */
  ageBuckets: { label: string; count: number }[]
  kkByStatus: { status: KKStatus; count: number }[]
  wargaByStatus: { status: WargaStatus; count: number }[]
}
