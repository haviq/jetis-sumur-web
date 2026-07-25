export function useSite() {
  return {
    id: 'jetis-sumur',
    slug: 'jetis-sumur',
    name: 'Padukuhan Jetis Sumur',
    shortName: 'Jetis Sumur',
    productName: 'Data Warga Jetis Sumur',
    tagline: 'Sistem informasi pendataan warga — statistik publik & dashboard pengelola.',
    alamat: 'Padukuhan Jetis Sumur, DI Yogyakarta',
    jamLayanan: 'Senin–Jumat 08.00–14.00 WIB',
    rtList: ['01', '02', '03', '04'],
    rwDefault: '01',
    wilayah: {
      padukuhan: 'Jetis Sumur',
      kalurahan: 'TBA',
      kapanewon: 'TBA',
      kabupaten: 'TBA',
      provinsi: 'DI Yogyakarta',
    },
  }
}

export function formatNum(n: number | undefined | null) {
  return new Intl.NumberFormat('id-ID').format(n || 0)
}
