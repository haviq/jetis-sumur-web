<template>
  <div class="container-page py-10 sm:py-12">
    <h1 class="font-display text-3xl font-bold">Profil Padukuhan</h1>
    <p class="muted mt-2 max-w-2xl">{{ site.tagline }}</p>

    <div class="grid gap-4 mt-8 sm:grid-cols-2">
      <div class="card p-5 sm:p-6">
        <h2 class="font-semibold mb-4">Identitas wilayah</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Padukuhan</dt>
            <dd class="font-medium">Jetis Sumur</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Provinsi</dt>
            <dd class="font-medium">DI Yogyakarta</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Jumlah RT</dt>
            <dd class="font-medium">{{ site.rtList.length }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="muted">Jam layanan</dt>
            <dd class="font-medium text-right">{{ site.jamLayanan }}</dd>
          </div>
        </dl>
      </div>
      <div class="card p-5 sm:p-6">
        <h2 class="font-semibold mb-3">Tentang sistem</h2>
        <p class="text-sm muted leading-relaxed">
          Website menampilkan statistik agregat penduduk. NIK, nama lengkap, alamat detail, dan nomor HP
          tidak dipublikasikan. Pengelolaan data dilakukan perangkat padukuhan lewat dashboard terproteksi
          yang hanya diketahui pengelola.
        </p>
        <ul class="mt-4 space-y-2 text-sm">
          <li class="flex gap-2"><span style="color: var(--accent)">✓</span> Statistik publik real-time</li>
          <li class="flex gap-2"><span style="color: var(--accent)">✓</span> Data di Google Spreadsheet</li>
          <li class="flex gap-2"><span style="color: var(--accent)">✓</span> Role: padukuhan / admin / super admin</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Profil' })
const site = useSite()
</script>
