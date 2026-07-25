<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Laporan & Export</h1>
      <p class="text-sm muted mt-1">Unduh rekap CSV (buka di Excel / Sheets)</p>

      <div class="grid gap-3 mt-6 sm:grid-cols-2">
        <a
          v-for="x in exports"
          :key="x.type"
          class="card card-hover p-5"
          :href="`/api/export?type=${x.type}`"
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
        <p class="text-xs muted mt-3">Import lewat menu Kartu Keluarga / Data Warga (tombol Import CSV).</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Laporan' })
const auth = useAuthStore()
const exports = [
  { type: 'warga', title: 'Rekap warga', desc: 'Seluruh jiwa + RT/RW/kepala KK' },
  { type: 'kk', title: 'Rekap KK', desc: 'Daftar kartu keluarga' },
  { type: 'mutasi', title: 'Rekap mutasi', desc: 'Riwayat masuk/keluar/lahir/meninggal' },
  { type: 'rekap', title: 'Rekap agregat', desc: 'Total, demografi, agama, RT' },
]

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
})
</script>
