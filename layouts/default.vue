<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 border-b" style="background: color-mix(in srgb, var(--bg) 92%, transparent); border-color: var(--border); backdrop-filter: blur(10px)">
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2 min-w-0">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style="background: var(--accent-dim); color: var(--accent)">JS</span>
          <div class="min-w-0">
            <div class="truncate text-sm font-bold leading-tight">{{ site.shortName }}</div>
            <div class="truncate text-[11px] muted">Pendataan Warga</div>
          </div>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link">{{ l.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <button class="btn btn-ghost px-2 py-1.5 text-xs" type="button" @click="toggleTheme" :title="theme === 'dark' ? 'Mode terang' : 'Mode gelap'">
            {{ theme === 'dark' ? '☀' : '☾' }}
          </button>
          <button class="md:hidden btn btn-ghost px-2 py-1.5" type="button" @click="open = !open" aria-label="Menu">☰</button>
        </div>
      </div>
      <div v-if="open" class="md:hidden border-t px-4 py-3 space-y-1" style="border-color: var(--border); background: var(--surface)">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link block" @click="open = false">{{ l.label }}</NuxtLink>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t mt-12" style="border-color: var(--border)">
      <div class="container-page py-8 grid gap-4 sm:grid-cols-2">
        <div>
          <div class="font-display text-lg font-bold">{{ site.name }}</div>
          <p class="muted text-sm mt-1">{{ site.tagline }}</p>
        </div>
        <div class="text-sm muted sm:text-right">
          <div>{{ site.alamat }}</div>
          <div class="mt-1">{{ site.jamLayanan }}</div>
          <div class="mt-3 text-xs">Data pribadi warga tidak ditampilkan di website publik.</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const site = useSite()
const open = ref(false)
const theme = ref<'dark' | 'light'>('dark')

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
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : '')
    if (t === 'dark') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('jetis-theme', t)
  }
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const saved = localStorage.getItem('jetis-theme') as 'dark' | 'light' | null
  applyTheme(saved === 'light' ? 'light' : 'dark')
})
</script>
