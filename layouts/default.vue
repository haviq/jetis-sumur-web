<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- Global cinematic atmosphere -->
    <div class="atm" aria-hidden="true">
      <canvas ref="canvasEl" class="atm-canvas" />
      <div class="atm-noise" />
      <div class="atm-glow atm-glow--a" />
      <div class="atm-glow atm-glow--b" />
      <div class="atm-glow atm-glow--c" />
    </div>

    <!--
      Preloader dual-curtain (haviq.dev pattern, Nuxt/CSS edition):
      1) Dua panel menutup layar (bg + fg)
      2) Typewriter PADUKUHAN JETIS SUMUR per huruf di tengah
      3) Hold sebentar
      4) EXIT: panel A slide ke atas, panel B slide ke atas stagger 150ms
      Skip di /ops + sesi yang sudah pernah load.
    -->
    <div
      v-if="phase !== 'done'"
      class="pre-wrap"
      :class="`is-${phase}`"
      aria-hidden="true"
    >
      <!-- Panel A: foreground (gelap, ada konten) -->
      <div class="pre-panel pre-panel--a">
        <div class="pre-noise" />
        <div class="pre-orb" />
        <div class="pre-center">
          <div class="pre-mark">JS</div>
          <div class="pre-type" aria-label="Padukuhan Jetis Sumur">
            <span
              v-for="(ch, i) in typedChars"
              :key="`${i}-${ch}`"
              class="pre-char"
              :class="{ space: ch === ' ' }"
            >{{ ch === ' ' ? '\u00A0' : ch }}</span>
            <span class="pre-caret" :class="{ blink: typingDone }" />
          </div>
          <div class="pre-sub">Pendataan Warga · DI Yogyakarta</div>
        </div>
      </div>
      <!-- Panel B: background (lebih terang, slide stagger) -->
      <div class="pre-panel pre-panel--b" />
    </div>

    <!-- Route curtain: mini slide per navigasi tab -->
    <div
      class="route-curtain"
      :class="{ 'is-active': curtainActive }"
      aria-hidden="true"
    />

    <header
      class="sticky top-0 z-40 border-b header-motion"
      style="background: color-mix(in srgb, var(--bg) 82%, transparent); border-color: var(--border); backdrop-filter: blur(14px)"
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
            :aria-label="theme === 'dark' ? 'Mode terang' : 'Mode gelap'"
            @click="toggleTheme"
          >
            <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
          </button>
          <button
            class="md:hidden btn btn-ghost px-2.5 py-1.5"
            type="button"
            :aria-label="open ? 'Tutup menu' : 'Buka menu'"
            :aria-expanded="open"
            @click="open = !open"
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

    <main class="flex-1 page-frame relative z-10">
      <slot />
    </main>

    <footer class="border-t mt-14 relative z-10" style="border-color: var(--border)">
      <div class="container-page py-9 grid gap-6 sm:grid-cols-2">
        <div>
          <div class="font-display text-lg font-bold">{{ site.name }}</div>
          <p class="muted text-sm mt-1.5 max-w-md">{{ site.tagline }}</p>
        </div>
        <div class="text-sm muted sm:text-right space-y-1">
          <div>{{ site.alamat }}</div>
          <div>{{ site.jamLayanan }}</div>
          <div class="text-xs pt-2">
            Data pribadi warga tidak ditampilkan di website publik.
            <NuxtLink to="/privasi" class="underline">Privasi</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const site = useSite()
const open = ref(false)
const theme = ref<'dark' | 'light'>('dark')
const canvasEl = ref<HTMLCanvasElement | null>(null)

/** idle → typing → hold → slide → done */
const phase = ref<'idle' | 'typing' | 'hold' | 'slide' | 'done'>('done')
const TYPE_TEXT = 'PADUKUHAN JETIS SUMUR'
const typedLen = ref(0)
const typingDone = ref(false)
const typedChars = computed(() => TYPE_TEXT.slice(0, typedLen.value).split(''))

/** Route curtain per-tab */
const curtainActive = ref(false)
let curtainTimer: ReturnType<typeof setTimeout> | null = null

const PRELOADER_KEY = 'jetis-preloader-v4'

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/profil', label: 'Profil' },
  { to: '/struktur', label: 'Struktur' },
  { to: '/statistik', label: 'Statistik' },
  { to: '/berita', label: 'Berita' },
  { to: '/layanan', label: 'Layanan' },
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
  if (!import.meta.client) return
  const path = useRoute().path || ''
  if (path.startsWith('/ops')) {
    phase.value = 'done'
    return
  }
  if (sessionStorage.getItem(PRELOADER_KEY) === '1') {
    phase.value = 'done'
    return
  }

  // Mulai preloader
  phase.value = 'typing'
  typedLen.value = 0
  typingDone.value = false

  // Ketik per huruf
  for (let i = 1; i <= TYPE_TEXT.length; i++) {
    typedLen.value = i
    await sleep(TYPE_TEXT[i - 1] === ' ' ? 90 : 52)
  }
  typingDone.value = true

  // Hold
  phase.value = 'hold'
  await sleep(480)

  // EXIT: dual-panel slide ke atas (panel-a 0.78s, panel-b stagger 0.15s = ~1.0s)
  phase.value = 'slide'
  await sleep(1050)

  phase.value = 'done'
  sessionStorage.setItem(PRELOADER_KEY, '1')
}

function triggerCurtain() {
  if (!import.meta.client) return
  if (curtainTimer) clearTimeout(curtainTimer)
  curtainActive.value = true
  curtainTimer = setTimeout(() => {
    curtainActive.value = false
  }, 520)
}

function startAtmosphere() {
  if (!import.meta.client) return
  const canvas = canvasEl.value
  if (!canvas) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let w = 0
  let h = 0
  let raf = 0
  interface Dot { x: number; y: number; r: number; vx: number; vy: number; a: number }
  let dots: Dot[] = []

  function resize() {
    w = canvas!.width = canvas!.offsetWidth
    h = canvas!.height = canvas!.offsetHeight
  }

  function seed() {
    const n = Math.min(Math.floor((w * h) / 9000), 80)
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.55 + 0.12,
    }))
  }

  function frame() {
    ctx!.clearRect(0, 0, w, h)
    const isLight = document.documentElement.hasAttribute('data-theme')
    for (const d of dots) {
      d.x += d.vx
      d.y += d.vy
      if (d.y < -8) d.y = h + 8
      if (d.y > h + 8) d.y = -8
      if (d.x < -8) d.x = w + 8
      if (d.x > w + 8) d.x = -8
      ctx!.beginPath()
      ctx!.fillStyle = isLight
        ? `rgba(30, 106, 68, ${d.a * 0.55})`
        : `rgba(94, 207, 143, ${d.a})`
      ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx!.fill()
    }
    raf = requestAnimationFrame(frame)
  }

  resize()
  seed()
  frame()
  const onResize = () => {
    resize()
    seed()
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
  })
}

onMounted(() => {
  const saved = localStorage.getItem('jetis-theme') as 'dark' | 'light' | null
  applyTheme(saved === 'light' ? 'light' : 'dark')
  startAtmosphere()
  runPreloader()
})

const router = useRouter()
router.afterEach((_to, from) => {
  // Trigger curtain hanya saat ganti halaman (bukan load pertama)
  if (from.name !== undefined) {
    triggerCurtain()
  }
})

watch(
  () => useRoute().fullPath,
  () => {
    open.value = false
  },
)
</script>
