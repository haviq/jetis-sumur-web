<template>
  <div class="container-page py-10 sm:py-12">
    <h1 class="font-display text-3xl font-bold">Struktur Organisasi</h1>
    <p class="muted mt-2 max-w-xl">Perangkat Padukuhan Jetis Sumur. Nama pejabat diisi dari data resmi padukuhan.</p>

    <div class="grid gap-3 mt-8 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="p in perangkat" :key="p.jabatan" class="card card-hover p-5">
        <div class="text-[11px] uppercase tracking-wide muted">{{ p.jabatan }}</div>
        <div class="font-semibold mt-1.5 text-lg">{{ p.nama }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Struktur' })
const perangkat = [
  { jabatan: 'Dukuh', nama: '— (isi data resmi)' },
  { jabatan: 'Ketua RT 01', nama: '—' },
  { jabatan: 'Ketua RT 02', nama: '—' },
  { jabatan: 'Ketua RT 03', nama: '—' },
  { jabatan: 'Ketua RT 04', nama: '—' },
  { jabatan: 'Sekretaris', nama: '—' },
]
</script>
