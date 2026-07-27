<template>
  <div class="container-page py-10 sm:py-12">

    <!-- Header -->
    <div class="max-w-2xl mb-10">
      <div class="flex items-center gap-3 mb-3">
        <h1 class="font-display text-3xl sm:text-4xl font-bold">Berita &amp; Pengumuman</h1>
        <span
          class="inline-flex items-center text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style="background: var(--accent-dim); color: var(--accent)"
        >Resmi</span>
      </div>
      <p class="muted text-sm leading-relaxed">
        Informasi terkini, pengumuman, dan kegiatan Padukuhan Jetis Sumur.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="card p-5 space-y-3 animate-pulse">
        <div class="h-4 rounded" style="background: var(--surface-soft); width: 40%" />
        <div class="h-5 rounded" style="background: var(--surface-soft); width: 80%" />
        <div class="h-4 rounded" style="background: var(--surface-soft); width: 100%" />
        <div class="h-4 rounded" style="background: var(--surface-soft); width: 70%" />
        <div class="h-4 rounded mt-2" style="background: var(--surface-soft); width: 35%" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!items.length"
      class="card flex flex-col items-center gap-4 py-16 text-center"
    >
      <div class="text-5xl" aria-hidden="true">📭</div>
      <div>
        <div class="font-semibold text-base">Belum ada berita</div>
        <p class="muted text-sm mt-1">Pengumuman dan berita padukuhan akan muncul di sini.</p>
      </div>
    </div>

    <!-- Grid berita -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="b in items"
        :key="b.id"
        class="card card-hover p-5 flex flex-col gap-3"
      >
        <!-- Tanggal badge -->
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded"
            style="background: var(--accent-dim); color: var(--accent)"
          >{{ formatTanggal(b.tanggal) }}</span>
        </div>

        <!-- Judul -->
        <h2 class="font-semibold text-base leading-snug line-clamp-2">{{ b.judul }}</h2>

        <!-- Ringkas truncate 2 baris -->
        <p class="text-sm muted leading-relaxed line-clamp-2">{{ b.ringkas }}</p>

        <!-- Footer: tag + link -->
        <div class="mt-auto flex items-center justify-between gap-2 pt-1">
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            style="background: var(--surface-soft); color: var(--fg-muted, #9ca3af)"
          >📢 Pengumuman</span>
          <NuxtLink
            :to="`/berita/${b.id}`"
            class="text-xs font-semibold shrink-0"
            style="color: var(--accent)"
          >Baca selengkapnya →</NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Berita & Pengumuman',
  meta: [
    {
      name: 'description',
      content: 'Berita, pengumuman, dan informasi terkini dari Padukuhan Jetis Sumur, Sleman, DI Yogyakarta.',
    },
  ],
})

interface BeritaItem {
  id: string
  judul: string
  ringkas: string
  isi: string
  tanggal: string
  published: boolean
}

const { data, pending } = await useFetch<{ ok: boolean; items: BeritaItem[] }>('/api/berita')
const items = computed(() => data.value?.items || [])

function formatTanggal(t: string) {
  if (!t) return t
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
