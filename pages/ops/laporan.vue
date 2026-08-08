<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Laporan & Export</h1>
      <p class="text-sm muted mt-1">CSV untuk Excel/Sheets · PDF lewat cetak browser</p>

      <h2 class="font-semibold mt-6 mb-3">Cetak / PDF</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a class="card card-hover p-5" href="/api/print?type=pejabat" target="_blank" rel="noopener">
          <div class="font-semibold">Laporan pejabat</div>
          <div class="text-sm muted mt-1">Rekap formal untuk dukuh / kalurahan</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Buka cetak →</div>
        </a>
        <a class="card card-hover p-5" href="/api/print?type=rekap" target="_blank" rel="noopener">
          <div class="font-semibold">Rekap agregat</div>
          <div class="text-sm muted mt-1">Total jiwa, KK, demografi, per RT</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Buka cetak →</div>
        </a>
        <a class="card card-hover p-5" href="/api/print?type=warga" target="_blank" rel="noopener">
          <div class="font-semibold">Daftar warga</div>
          <div class="text-sm muted mt-1">Tabel NIK + nama + RT (login required)</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Buka cetak →</div>
        </a>
        <NuxtLink class="card card-hover p-5" to="/ops/surat">
          <div class="font-semibold">Surat + QR</div>
          <div class="text-sm muted mt-1">Domisili, pengantar, usaha, SKTM + arsip</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Form surat →</div>
        </NuxtLink>
        <a class="card card-hover p-5" href="/api/backup" target="_blank" rel="noopener">
          <div class="font-semibold">Backup JSON</div>
          <div class="text-sm muted mt-1">Export penuh untuk arsip padukuhan</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Unduh →</div>
        </a>
        <NuxtLink class="card card-hover p-5" to="/ops/import">
          <div class="font-semibold">Import wizard</div>
          <div class="text-sm muted mt-1">Preview validasi CSV sebelum commit</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Buka wizard →</div>
        </NuxtLink>
      </div>

      <h2 class="font-semibold mt-8 mb-3">Export CSV</h2>
      <div class="flex items-center gap-3 mb-4">
        <span class="text-sm font-semibold">Filter RT:</span>
        <select v-model="selectedRt" class="input py-1 px-3 max-w-[150px] text-sm">
          <option value="">Semua RT</option>
          <option v-for="rt in rtList" :key="rt" :value="rt">RT {{ rt }}</option>
        </select>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <a
          v-for="x in exports"
          :key="x.type"
          class="card card-hover p-5"
          :href="`/api/export?type=${x.type}${selectedRt ? `&rt=${selectedRt}` : ''}`"
          target="_blank"
          rel="noopener"
        >
          <div class="font-semibold">{{ x.title }}</div>
          <div class="text-sm muted mt-1">{{ x.desc }}</div>
          <div class="text-xs mt-3" style="color: var(--accent)">Unduh CSV →</div>
        </a>
      </div>

      <div class="card p-5 mt-6">
        <h2 class="font-semibold">Template import</h2>
        <p class="text-sm muted mt-1">Header CSV yang didukung:</p>
        <ul class="mt-3 space-y-2 text-sm">
          <li>
            <strong>KK:</strong>
            <code class="text-xs">nomor_kk,kepala_keluarga,rt,rw,alamat,status_rumah</code>
          </li>
          <li>
            <strong>Warga:</strong>
            <code class="text-xs">nik,nama,nomor_kk,jk,tanggal_lahir,agama,pendidikan,pekerjaan,hubungan_kk,status</code>
          </li>
        </ul>
        <p class="text-xs muted mt-3">Import lewat menu Kartu Keluarga / Data Warga.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Laporan' })
const auth = useAuthStore()
const selectedRt = ref('')
const rtList = ['01', '02', '03', '04']

const exports = [
  { type: 'warga', title: 'Rekap warga', desc: 'Seluruh jiwa + RT/RW/kepala KK' },
  { type: 'kk', title: 'Rekap KK', desc: 'Daftar kartu keluarga' },
  { type: 'mutasi', title: 'Rekap mutasi', desc: 'Riwayat masuk/keluar/lahir/meninggal' },
  { type: 'rekap', title: 'Rekap agregat CSV', desc: 'Total, demografi, agama, RT' },
]

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
})
</script>
