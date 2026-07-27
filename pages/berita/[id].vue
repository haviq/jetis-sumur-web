<template>
  <div class="container-page py-10 sm:py-12">

    <!-- Loading state -->
    <div v-if="pending" class="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div class="h-4 rounded" style="background: var(--surface-soft); width: 30%" />
      <div class="h-8 rounded" style="background: var(--surface-soft); width: 80%" />
      <div class="h-4 rounded" style="background: var(--surface-soft); width: 100%" />
      <div class="h-4 rounded" style="background: var(--surface-soft); width: 90%" />
      <div class="h-4 rounded" style="background: var(--surface-soft); width: 95%" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!berita"
      class="max-w-2xl mx-auto text-center py-16 space-y-5"
    >
      <div class="text-6xl" aria-hidden="true">📭</div>
      <div>
        <h1 class="font-display text-2xl font-bold">Berita tidak ditemukan</h1>
        <p class="muted mt-2">Berita yang Anda cari mungkin sudah dihapus atau belum dipublikasikan.</p>
      </div>
      <NuxtLink to="/berita" class="btn btn-primary inline-flex items-center gap-2">
        ← Kembali ke daftar berita
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else class="max-w-3xl mx-auto">
      <!-- Back button -->
      <NuxtLink
        to="/berita"
        class="inline-flex items-center gap-1.5 text-sm muted mb-6 hover:opacity-70 transition-opacity"
      >
        ← Kembali ke daftar berita
      </NuxtLink>

      <!-- Tanggal -->
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-xs font-semibold px-2.5 py-1 rounded"
          style="background: var(--accent-dim); color: var(--accent)"
        >{{ formatTanggal(berita.tanggal) }}</span>
        <span
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          style="background: var(--surface-soft); color: var(--fg-muted, #9ca3af)"
        >📢 Pengumuman</span>
      </div>

      <!-- Judul -->
      <h1 class="font-display text-3xl sm:text-4xl font-bold leading-tight mb-6">
        {{ berita.judul }}
      </h1>

      <!-- Isi lengkap -->
      <div
        class="prose prose-sm sm:prose max-w-none"
        style="
          color: var(--fg);
          --tw-prose-headings: var(--fg);
          --tw-prose-links: var(--accent);
          --tw-prose-bold: var(--fg);
          --tw-prose-quotes: var(--fg-muted);
        "
      >
        <div class="whitespace-pre-wrap leading-relaxed text-base">{{ berita.isi }}</div>
      </div>

      <!-- Footer -->
      <div class="mt-12 pt-6 border-t" style="border-color: var(--border)">
        <NuxtLink
          to="/berita"
          class="btn btn-ghost inline-flex items-center gap-2"
        >
          ← Kembali ke daftar berita
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

interface BeritaItem {
  id: string
  judul: string
  ringkas: string
  isi: string
  tanggal: string
  published: boolean
}

const { data, pending } = await useFetch<{ ok: boolean; items: BeritaItem[] }>('/api/berita')
const berita = computed(() => {
  const items = data.value?.items || []
  return items.find((b) => b.id === id)
})

// Dynamic head
useHead(() => ({
  title: berita.value?.judul || 'Berita',
  meta: berita.value
    ? [
        {
          name: 'description',
          content: berita.value.ringkas || berita.value.judul,
        },
      ]
    : [],
}))

function formatTanggal(t: string) {
  if (!t) return t
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
