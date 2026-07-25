<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Kontak</h1>
    <p class="muted mt-2">Hubungi balai padukuhan untuk layanan administrasi.</p>
    <div class="card p-6 mt-8 max-w-lg space-y-3 text-sm">
      <div><span class="muted">Alamat</span><div class="font-medium">{{ site.alamat }}</div></div>
      <div><span class="muted">Jam layanan</span><div class="font-medium">{{ site.jamLayanan }}</div></div>
      <div><span class="muted">Catatan privasi</span><div class="font-medium">Data warga hanya untuk administrasi padukuhan. Tidak dipublikasikan.</div></div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kontak' })
const site = useSite()
</script>
