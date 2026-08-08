<template>
  <div class="container-page max-w-3xl py-10">

    <!-- Header -->
    <div class="mb-10">
      <div
        class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
        style="background: var(--accent-dim); color: var(--accent)"
      >
        🔒 Privasi & Kepatuhan
      </div>
      <h1 class="font-display text-3xl sm:text-4xl font-bold">Kebijakan Privasi</h1>
      <p class="muted text-sm mt-3">
        Berlaku efektif: <strong>1 Januari 2025</strong> · Padukuhan Jetis Sumur, Kalurahan Glagaharjo,
        Kapanewon Cangkringan, D.I. Yogyakarta 55583
      </p>
    </div>

    <div class="space-y-5 text-sm">

      <!-- Section 1 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">1.</span> Data yang Kami Kumpulkan
        </h2>
        <p class="leading-relaxed muted">
          Sistem pendataan warga Padukuhan Jetis Sumur mengumpulkan data kependudukan berikut
          <strong>hanya dari warga yang bersangkutan atau perangkat padukuhan yang berwenang</strong>:
        </p>
        <ul class="space-y-2 pl-1">
          <li v-for="item in dataCollected" :key="item.label" class="flex gap-3">
            <span style="color: var(--accent)">▸</span>
            <span class="leading-relaxed muted">
              <strong class="text-inherit" style="color: var(--fg)">{{ item.label }}</strong>
              — {{ item.desc }}
            </span>
          </li>
        </ul>
        <div
          class="rounded-lg px-4 py-3 text-xs leading-relaxed"
          style="background: var(--accent-dim); color: var(--accent)"
        >
          🛡 Data di atas <strong>tidak pernah dipublikasikan</strong> di halaman publik website ini.
          Yang tampil di beranda dan statistik hanya angka agregat (jumlah jiwa, KK, dan demografi umum).
        </div>
      </div>

      <!-- Section 2 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">2.</span> Bagaimana Data Digunakan
        </h2>
        <p class="leading-relaxed muted">
          Data yang dikumpulkan <strong>semata-mata digunakan untuk keperluan administrasi padukuhan</strong>,
          meliputi:
        </p>
        <ul class="space-y-1.5 pl-1">
          <li v-for="use in dataUses" :key="use" class="flex gap-3 muted">
            <span style="color: var(--accent)">✓</span>
            <span>{{ use }}</span>
          </li>
        </ul>
        <p class="muted leading-relaxed">
          Data <strong>tidak dijual, tidak dibagikan, dan tidak digunakan</strong> untuk keperluan
          komersial, pemasaran, atau pihak ketiga mana pun di luar perangkat padukuhan.
        </p>
      </div>

      <!-- Section 3 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">3.</span> Siapa yang Dapat Mengakses Data
        </h2>
        <p class="muted leading-relaxed">
          Akses ke data rinci warga dibatasi secara teknis hanya untuk:
        </p>
        <div class="space-y-3">
          <div v-for="acc in accessRoles" :key="acc.role" class="flex gap-3">
            <span class="text-lg flex-shrink-0">{{ acc.icon }}</span>
            <div>
              <div class="font-semibold text-sm">{{ acc.role }}</div>
              <p class="muted text-xs mt-0.5 leading-relaxed">{{ acc.desc }}</p>
            </div>
          </div>
        </div>
        <p class="muted text-xs leading-relaxed">
          Dashboard operasional berada di jalur <code class="text-xs px-1 py-0.5 rounded" style="background: var(--border)">/ops</code>
          yang tidak terhubung dari menu publik dan wajib login.
        </p>
      </div>

      <!-- Section 4 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">4.</span> Keamanan Data
        </h2>
        <p class="muted leading-relaxed">
          Kami menerapkan berbagai lapisan keamanan teknis untuk melindungi data warga:
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="sec in securityMeasures" :key="sec.title" class="rounded-lg p-3 space-y-1" style="background: var(--surface-2, var(--border))">
            <div class="flex items-center gap-2 font-semibold text-xs">
              <span>{{ sec.icon }}</span>{{ sec.title }}
            </div>
            <p class="muted text-xs leading-relaxed">{{ sec.desc }}</p>
          </div>
        </div>
        <p class="muted text-xs leading-relaxed">
          Backup data berisi informasi sensitif. Pengelola wajib menyimpan backup di media
          terenkripsi milik padukuhan dan <strong>dilarang mengunggahnya ke media sosial atau layanan
          penyimpanan publik</strong>.
        </p>
      </div>

      <!-- Section 5 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">5.</span> Hak Warga
        </h2>
        <p class="muted leading-relaxed">
          Setiap warga Padukuhan Jetis Sumur berhak atas:
        </p>
        <ul class="space-y-2 pl-1">
          <li v-for="right in citizenRights" :key="right.title" class="flex gap-3 muted">
            <span style="color: var(--accent)">→</span>
            <span class="leading-relaxed">
              <strong style="color: var(--fg)">{{ right.title }}</strong>
              — {{ right.desc }}
            </span>
          </li>
        </ul>
        <div class="rounded-lg px-4 py-3 text-xs leading-relaxed" style="background: var(--surface-2, var(--border))">
          Untuk mengajukan permintaan koreksi atau penghapusan data, silakan hubungi perangkat padukuhan
          secara langsung dengan membawa dokumen identitas yang sah.
        </div>
      </div>

      <!-- Section 6 -->
      <div class="card p-6 space-y-3">
        <h2 class="font-display text-base font-bold flex items-center gap-2">
          <span style="color: var(--accent)">6.</span> Kontak
        </h2>
        <p class="muted leading-relaxed">
          Jika Anda memiliki pertanyaan, keberatan, atau permintaan terkait kebijakan privasi ini,
          silakan hubungi perangkat padukuhan melalui:
        </p>
        <ul class="space-y-1.5 pl-1">
          <li class="flex gap-3 muted"><span>🏠</span> Kantor Padukuhan Jetis Sumur, Glagaharjo, Cangkringan, Sleman 55583</li>
          <li class="flex gap-3 muted"><span>🕐</span> Jam layanan: Senin–Jumat, 08.00–14.00 WIB</li>
          <li class="flex gap-3 muted"><span>📋</span> Portal pengajuan: <NuxtLink to="/layanan" class="underline" style="color: var(--accent)">Layanan Warga</NuxtLink></li>
        </ul>
      </div>

    </div>

    <!-- Footer nav -->
    <div class="mt-8 flex flex-wrap gap-2">
      <NuxtLink class="btn btn-ghost text-sm" to="/">← Beranda</NuxtLink>
      <NuxtLink class="btn btn-ghost text-sm" to="/layanan">Portal Layanan</NuxtLink>
      <NuxtLink class="btn btn-ghost text-sm" to="/kontak">Kontak</NuxtLink>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kebijakan Privasi' })

const dataCollected = [
  { label: 'Nama lengkap & NIK', desc: 'identitas utama warga sesuai dokumen resmi kependudukan.' },
  { label: 'Nomor Kartu Keluarga (KK)', desc: 'untuk pengelompokan data per keluarga.' },
  { label: 'Alamat lengkap', desc: 'RT/RW, dusun, dan domisili aktual dalam wilayah padukuhan.' },
  { label: 'Nomor HP / WA', desc: 'opsional, digunakan hanya untuk notifikasi pengajuan layanan.' },
  { label: 'Data demografi', desc: 'usia, jenis kelamin, pekerjaan, pendidikan — untuk statistik agregat.' },
]

const dataUses = [
  'Penerbitan surat keterangan dan dokumen administrasi padukuhan',
  'Penyusunan statistik kependudukan dan laporan ke kalurahan',
  'Verifikasi identitas saat pengajuan layanan warga',
  'Pembaruan data kependudukan atas permintaan warga',
  'Audit internal dan pemenuhan kewajiban administrasi pemerintahan',
]

const accessRoles = [
  {
    icon: '👤',
    role: 'Dukuh (Kepala Padukuhan)',
    desc: 'Akses penuh ke seluruh data warga dan log aktivitas melalui dashboard operasional.',
  },
  {
    icon: '🔑',
    role: 'Perangkat Padukuhan',
    desc: 'Akses baca dan edit data warga sesuai kewenangan yang ditetapkan oleh Dukuh.',
  },
  {
    icon: '🌐',
    role: 'Publik (tanpa login)',
    desc: 'Hanya dapat melihat informasi agregat, profil padukuhan, dan mengajukan layanan via form. Tidak ada akses ke data individual.',
  },
]

const securityMeasures = [
  {
    icon: '⏱',
    title: 'Sesi 8 Jam',
    desc: 'Sesi login perangkat padukuhan berakhir otomatis setelah 8 jam tidak aktif.',
  },
  {
    icon: '🚫',
    title: 'Rate-limit Login',
    desc: 'Percobaan login dibatasi untuk mencegah serangan brute-force ke dashboard operasional.',
  },
  {
    icon: '🗑',
    title: 'Soft-delete',
    desc: 'Data yang dihapus tetap tersimpan tersembunyi untuk keperluan audit, tidak langsung terhapus permanen.',
  },
  {
    icon: '📋',
    title: 'Audit Log',
    desc: 'Setiap aksi pengelola (tambah, ubah, hapus) dicatat beserta waktu dan identitas operator.',
  },
]

const citizenRights = [
  {
    title: 'Akses data',
    desc: 'mengetahui data apa saja yang tersimpan tentang diri Anda di sistem padukuhan.',
  },
  {
    title: 'Koreksi data',
    desc: 'meminta perbaikan data yang tidak akurat atau tidak lengkap kepada perangkat padukuhan.',
  },
  {
    title: 'Keberatan penggunaan',
    desc: 'menyampaikan keberatan jika data Anda digunakan di luar tujuan administrasi padukuhan.',
  },
]
</script>
