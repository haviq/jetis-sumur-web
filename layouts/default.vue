<template>
  <div class="min-h-screen flex flex-col">
    <!-- Preloader first paint -->
    <div class="preloader" :class="{ hide: ready }" aria-hidden="true">
      <div class="preloader-mark">JS</div>
    </div>

    <header
      class="sticky top-0 z-40 border-b"
      style="background: color-mix(in srgb, var(--bg) 90%, transparent); border-color: var(--border); backdrop-filter: blur(12px)"
    >
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0" @click="open = false">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold"
            style="background: var(--accent-dim); color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border))"
          >JS</span>
          <div class="min-w-0">
            <div class="truncate text-sm font-bold leading-tight">{{ site.shortName }}</div>
            <div class="truncate text-[11px] muted">Pendataan Warga</div>
          </div>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-0.5">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link">{{ l.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <button
            class="btn btn-ghost px-2.5 py-1.5 text-sm"
            type="button"
            @click="toggleTheme"
            :aria-label="theme === 'dark' ? 'Mode terang' : 'Mode gelap'"
          >
            <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
          </button>
          <button
            class="md:hidden btn btn-ghost px-2.5 py-1.5"
            type="button"
            @click="open = !open"
            :aria-label="open ? 'Tutup menu' : 'Buka menu'"
            :aria-expanded="open"
          >
            <span aria-hidden="true">{{ open ? '✕' : '☰' }}</span>
          </button>
        </div>
      </div>

      <Transition name="page">
        <div
          v-if="open"
          class="md:hidden border-t px-4 py-3 space-y-1"
          style="border-color: var(--border); background: var(--surface)"
        >
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="nav-link block"
            @click="open = false"
          >{{ l.label }}</NuxtLink>
        </div>
      </Transition>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t mt-14" style="border-color: var(--border)">
      <div class="container-page py-9 grid gap-6 sm:grid-cols-2">
        <div>
          <div class="font-display text-lg font-bold">{{ site.name }}</div>
          <p class="muted text-sm mt-1.5 max-w-md">{{ site.tagline }}</p>
        </div>
        <div class="text-sm muted sm:text-right space-y-1">
          <div>{{ site.alamat }}</div>
          <div>{{ site.jamLayanan }}</div>
          <div class="text-xs pt-2">Data pribadi warga tidak ditampilkan di website publik.</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const site = useSite()
const open = ref(false)
const theme = ref<'dark' | 'light'>('dark')
const ready = ref(false)

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/profil', label: 'Profil' },
  { to: '/struktur', label: 'Struktur' },
  { to: '/statistik', label: 'Statistik' },
  { to: '/berita', label: 'Berita' },
  { to: '/kontak', label: 'Kontak' },
]

function applyTheme(t: 'dark' | 'light') {
  theme.value = t
  if (!import.meta.client) return
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
  localStorage.setItem('jetis-theme', t)
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const saved = localStorage.getItem('jetis-theme') as 'dark' | 'light' | null
  applyTheme(saved === 'light' ? 'light' : 'dark')
  requestAnimationFrame(() => {
    ready.value = true
  })
})

watch(
  () => useRoute().fullPath,
  () => {
    open.value = false
  },
)
</script>
