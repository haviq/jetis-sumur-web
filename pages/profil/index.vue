<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Profil Padukuhan</h1>
    <p class="muted mt-2 max-w-2xl">{{ site.tagline }}</p>

    <div class="grid gap-4 mt-8 sm:grid-cols-2">
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Identitas wilayah</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between gap-4"><dt class="muted">Padukuhan</dt><dd>Jetis Sumur</dd></div>
          <div class="flex justify-between gap-4"><dt class="muted">Provinsi</dt><dd>DI Yogyakarta</dd></div>
          <div class="flex justify-between gap-4"><dt class="muted">Jumlah RT</dt><dd>{{ site.rtList.length }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="muted">Jam layanan</dt><dd>{{ site.jamLayanan }}</dd></div>
        </dl>
      </div>
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Tentang sistem</h2>
        <p class="text-sm muted leading-relaxed">
          Website ini menampilkan statistik agregat penduduk. NIK, nama lengkap, alamat detail, dan nomor HP
          tidak dipublikasikan. Pengelolaan data dilakukan perangkat padukuhan melalui dashboard terproteksi.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Profil' })
const site = useSite()
</script>
