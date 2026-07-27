<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: var(--bg)">
    <div class="max-w-lg w-full text-center space-y-6">
      <!-- Icon -->
      <div class="text-7xl" aria-hidden="true">
        {{ error.statusCode === 404 ? '🔍' : '⚠️' }}
      </div>

      <!-- Error code badge -->
      <div
        class="inline-flex items-center text-sm font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
        style="background: var(--accent-dim); color: var(--accent)"
      >
        Error {{ error.statusCode || 500 }}
      </div>

      <!-- Title & message -->
      <div>
        <h1 class="font-display text-3xl font-bold mb-3" style="color: var(--fg)">
          {{ errorTitle }}
        </h1>
        <p class="text-base leading-relaxed" style="color: var(--fg-muted, #9ca3af)">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <NuxtLink
          to="/"
          class="btn btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
          style="background: var(--accent); color: #fff"
        >
          ← Kembali ke Beranda
        </NuxtLink>

        <button
          v-if="error.statusCode !== 404"
          class="btn btn-ghost inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
          style="border: 1px solid var(--border); color: var(--fg)"
          @click="handleError"
        >
          🔄 Muat ulang
        </button>
      </div>

      <!-- Dev info (only if dev mode or detailed error) -->
      <details v-if="error.message" class="mt-8 text-left">
        <summary class="text-sm font-semibold cursor-pointer" style="color: var(--fg-muted, #9ca3af)">
          Detail teknis
        </summary>
        <pre
          class="mt-3 p-4 rounded-lg text-xs overflow-auto"
          style="background: var(--surface-soft); color: var(--fg-muted, #9ca3af)"
        >{{ error.message }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const errorTitle = computed(() => {
  if (props.error.statusCode === 404) {
    return 'Halaman tidak ditemukan'
  }
  return 'Terjadi kesalahan'
})

const errorMessage = computed(() => {
  if (props.error.statusCode === 404) {
    return 'Halaman yang Anda cari tidak ada atau telah dipindahkan. Silakan kembali ke beranda atau periksa URL Anda.'
  }
  return 'Maaf, terjadi kesalahan pada server. Silakan muat ulang halaman atau hubungi administrator jika masalah berlanjut.'
})

function handleError() {
  // Reload page
  if (import.meta.client) {
    window.location.reload()
  }
}
</script>
