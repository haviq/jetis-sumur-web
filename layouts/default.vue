<template>
  <div class="min-h-screen flex flex-col">
    <!-- Preloader: curtain top→bottom then bottom→top + typewriter -->
    <div
      class="preloader"
      :class="{
        'is-done': phase === 'done',
        'is-exit-down': phase === 'exit-down',
        'is-exit-up': phase === 'exit-up',
      }"
      aria-hidden="true"
    >
      <div class="preloader-curtain preloader-curtain--top" />
      <div class="preloader-curtain preloader-curtain--bottom" />

      <div class="preloader-center">
        <div class="preloader-mark">JS</div>
        <div class="preloader-type" aria-label="Padukuhan Jetis Sumur">
          <span
            v-for="(ch, i) in typedChars"
            :key="i"
            class="preloader-char"
            :class="{ space: ch === ' ' }"
            :style="{ animationDelay: `${i * 28}ms` }"
          >{{ ch === ' ' ? '\u00A0' : ch }}</span>
          <span class="preloader-caret" :class="{ blink: typingDone }" />
        </div>
        <div class="preloader-sub">Pendataan Warga</div>
      </div>
    </div>

    <header
      class="sticky top-0 z-40 border-b header-motion"
      style="background: color-mix(in srgb, var(--bg) 90%, transparent); border-color: var(--border); backdrop-filter: blur(12px)"
    >
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0" @click="open = false">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold logo-pop"
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

      <Transition name="menu">
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

    <main class="flex-1 page-frame">
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

/** idle → typing → exit-down → exit-up → done */
const phase = ref<'idle' | 'typing' | 'exit-down' | 'exit-up' | 'done'>('idle')
const TYPE_TEXT = 'PADUKUHAN JETIS SUMUR'
const typedLen = ref(0)
const typingDone = ref(false)

const typedChars = computed(() => TYPE_TEXT.slice(0, typedLen.value).split(''))

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function runPreloader() {
  // Skip long intro on ops routes (admin work)
  const path = useRoute().path || ''
  if (path.startsWith('/ops')) {
    phase.value = 'done'
    return
  }

  // Only once per session
  if (import.meta.client && sessionStorage.getItem('jetis-preloader') === '1') {
    phase.value = 'done'
    return
  }

  phase.value = 'typing'
  typedLen.value = 0
  typingDone.value = false

  // Type letter by letter
  for (let i = 1; i <= TYPE_TEXT.length; i++) {
    typedLen.value = i
    await sleep(TYPE_TEXT[i - 1] === ' ' ? 90 : 55)
  }
  typingDone.value = true
  await sleep(420)

  // Curtain: top → bottom
  phase.value = 'exit-down'
  await sleep(520)

  // Curtain: bottom → top (wipe off)
  phase.value = 'exit-up'
  await sleep(560)

  phase.value = 'done'
  if (import.meta.client) sessionStorage.setItem('jetis-preloader', '1')
}

onMounted(() => {
  const saved = localStorage.getItem('jetis-theme') as 'dark' | 'light' | null
  applyTheme(saved === 'light' ? 'light' : 'dark')
  runPreloader()
})

watch(
  () => useRoute().fullPath,
  () => {
    open.value = false
  },
)
</script>
