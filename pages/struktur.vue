<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Struktur Organisasi</h1>
    <p class="muted mt-2">Perangkat Padukuhan Jetis Sumur (dapat dilengkapi data resmi).</p>

    <div class="grid gap-3 mt-8 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="p in perangkat" :key="p.jabatan" class="card p-5">
        <div class="text-xs muted uppercase tracking-wide">{{ p.jabatan }}</div>
        <div class="font-semibold mt-1">{{ p.nama }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Struktur' })
const perangkat = [
  { jabatan: 'Dukuh', nama: '— (isi data resmi)' },
  { jabatan: 'Ketua RT 01', nama: '— ' },
  { jabatan: 'Ketua RT 02', nama: '— ' },
  { jabatan: 'Ketua RT 03', nama: '— ' },
  { jabatan: 'Ketua RT 04', nama: '— ' },
  { jabatan: 'Sekretaris', nama: '— ' },
]
</script>
