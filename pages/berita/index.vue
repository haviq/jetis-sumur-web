<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Berita</h1>
    <p class="muted mt-2">Pengumuman padukuhan.</p>
    <div class="grid gap-3 mt-8">
      <article v-for="b in items" :key="b.id" class="card p-5">
        <div class="text-xs muted">{{ b.tanggal }}</div>
        <h2 class="font-semibold text-lg mt-1">{{ b.judul }}</h2>
        <p class="text-sm muted mt-2">{{ b.ringkas }}</p>
        <p class="text-sm mt-3 leading-relaxed">{{ b.isi }}</p>
      </article>
      <div v-if="!items.length" class="card p-5 muted">Belum ada berita.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Berita' })
const { data } = await useFetch<{ ok: boolean; items: any[] }>('/api/berita')
const items = computed(() => data.value?.items || [])
</script>
