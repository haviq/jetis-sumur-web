<template>
  <div>
    <!-- ── Hero ── -->
    <section class="hero-section relative overflow-hidden">
      <div class="absolute inset-0 hero-grid opacity-35 pointer-events-none" />
      <!-- decorative lines -->
      <div class="hero-lines" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div class="container-page relative py-14 sm:py-20">
        <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <!-- Left: copy -->
          <div class="reveal reveal-d1">
            <p class="hero-badge mb-5">
              <span class="hero-badge__dot" />
              {{ heroBadge }}
            </p>

            <h1 class="font-display text-[2.1rem] sm:text-[2.75rem] lg:text-[3.1rem] font-bold leading-[1.12] tracking-tight">
              <span class="hero-type">{{ heroTyped }}</span><span
                v-if="!heroDone"
                class="hero-caret"
                aria-hidden="true"
              />
            </h1>

            <p class="mt-5 text-[15px] leading-relaxed max-w-lg reveal reveal-d2" style="color: var(--muted)">
              Data kependudukan Padukuhan Jetis Sumur — KK, jiwa, dan mutasi
              tersimpan rapi di spreadsheet, bisa diakses kapan saja.
            </p>

            <div class="mt-8 flex flex-wrap gap-3 reveal reveal-d3">
              <NuxtLink to="/statistik" class="btn btn-primary btn-lg">
                Lihat statistik
                <span aria-hidden="true" class="ml-1.5">→</span>
              </NuxtLink>
              <NuxtLink to="/profil" class="btn btn-ghost btn-lg">
                Profil padukuhan
              </NuxtLink>
            </div>

            <p class="mt-5 text-xs reveal reveal-d4" style="color: var(--muted2)">
              NIK, nama, dan nomor HP tidak dipublikasikan.
            </p>
          </div>

          <!-- Right: stats card -->
          <div class="stats-card reveal reveal-d2">
            <div class="stats-card__header">
              <div class="flex items-center gap-2">
                <span class="stats-card__icon">📊</span>
                <span class="font-semibold text-sm">Ringkasan penduduk</span>
              </div>
              <span class="badge badge--mode">{{ stats?.mode || 'live' }}</span>
            </div>

            <div class="stats-card__grid">
              <div class="stat-cell stat-cell--featured">
                <div class="stat-cell__label">Total penduduk</div>
                <div class="stat-num">{{ formatNum(stats?.totalPenduduk) }}</div>
                <div class="stat-cell__sub">jiwa terdaftar</div>
              </div>
              <div class="stat-cell stat-cell--featured">
                <div class="stat-cell__label">Kartu Keluarga</div>
                <div class="stat-num">{{ formatNum(stats?.totalKk) }}</div>
                <div class="stat-cell__sub">KK aktif</div>
              </div>
              <div class="stat-cell">
                <div class="stat-cell__label">Laki-laki</div>
                <div class="stat-num text-2xl">{{ formatNum(stats?.laki) }}</div>
              </div>
              <div class="stat-cell">
                <div class="stat-cell__label">Perempuan</div>
                <div class="stat-num text-2xl">{{ formatNum(stats?.perempuan) }}</div>
              </div>
            </div>

            <div class="stats-card__footer">
              <span style="color: var(--muted2)">Padukuhan Jetis Sumur</span>
              <NuxtLink to="/statistik" class="stats-card__link">
                Detail →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Kelompok Umur ── -->
    <section class="container-page pb-14">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Kelompok umur</h2>
        <NuxtLink to="/statistik" class="section-more">Detail →</NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          v-for="(b, i) in ageBands"
          :key="b.label"
          class="age-card reveal"
          :class="`reveal-d${Math.min(i + 1, 5)}`"
        >
          <div class="age-card__label">{{ b.label }}</div>
          <div class="stat-num text-2xl mt-2">{{ formatNum(b.value) }}</div>
        </div>
      </div>
    </section>

    <!-- ── Penduduk per RT ── -->
    <section class="container-page pb-14">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Penduduk per RT</h2>
      </div>
      <div class="card p-5 sm:p-6 reveal reveal-d2">
        <div class="space-y-4">
          <div
            v-for="r in stats?.perRt || []"
            :key="r.rt"
            class="rt-row"
          >
            <span class="rt-row__label">RT {{ r.rt }}</span>
            <div class="bar flex-1">
              <i :style="{ width: barWidth(r.jiwa) + '%' }" />
            </div>
            <span class="rt-row__val">{{ r.jiwa }}</span>
          </div>
          <p v-if="!(stats?.perRt || []).length" class="muted text-sm">Belum ada data.</p>
        </div>
      </div>
    </section>

    <!-- ── Fitur / Layanan ── -->
    <section class="container-page pb-14">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Yang tersedia di web ini</h2>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="(f, i) in features"
          :key="f.t"
          class="feature-card card card-hover p-5 reveal"
          :class="`reveal-d${i + 1}`"
        >
          <div class="feature-card__icon" aria-hidden="true">{{ f.i }}</div>
          <div class="font-semibold mt-3">{{ f.t }}</div>
          <p class="text-sm mt-1.5 leading-relaxed" style="color: var(--muted)">{{ f.d }}</p>
        </div>
      </div>
    </section>

    <!-- ── Berita ── -->
    <section class="container-page pb-20">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Berita padukuhan</h2>
        <NuxtLink to="/berita" class="section-more">Semua →</NuxtLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <article
          v-for="(b, i) in berita.slice(0, 2)"
          :key="b.id"
          class="berita-card card card-hover p-5 reveal"
          :class="`reveal-d${i + 1}`"
        >
          <div class="text-xs mb-2" style="color: var(--muted2)">{{ b.tanggal }}</div>
          <h3 class="font-semibold text-[1.05rem] leading-snug">{{ b.judul }}</h3>
          <p class="text-sm mt-2 leading-relaxed" style="color: var(--muted)">{{ b.ringkas }}</p>
        </article>
        <div v-if="!berita.length" class="card p-5 text-sm" style="color: var(--muted)">
          Belum ada berita.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Beranda · Jetis Sumur' })

const { data } = await useFetch<{ ok: boolean; stats: any }>('/api/stats')
const stats = computed(() => data.value?.stats)

const { data: beritaRes } = await useFetch<{ ok: boolean; items: any[] }>('/api/berita')
const berita = computed(() => beritaRes.value?.items || [])

const maxJiwa = computed(() => Math.max(...(stats.value?.perRt || []).map((r: any) => r.jiwa), 1))
function barWidth(v: number) {
  return Math.round((v / maxJiwa.value) * 100)
}
function formatNum(n: number | undefined) {
  if (n === undefined || n === null) return '–'
  return n.toLocaleString('id-ID')
}

const ageBands = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { label: 'Balita (0–4)', value: s.balita ?? 0 },
    { label: 'Anak (5–14)', value: s.anak ?? 0 },
    { label: 'Remaja (15–24)', value: s.remaja ?? 0 },
    { label: 'Dewasa (25–59)', value: s.dewasa ?? 0 },
    { label: 'Lansia (60+)', value: s.lansia ?? 0 },
  ]
})

const features = [
  { i: '📋', t: 'Data kependudukan', d: 'Statistik warga, KK, dan persebaran RT yang bisa dilihat siapa saja.' },
  { i: '🏠', t: 'Pengelolaan KK & jiwa', d: 'Pengelola input lewat dashboard terproteksi, bukan menu publik.' },
  { i: '🔁', t: 'Mutasi warga', d: 'Catat masuk, keluar, lahir, meninggal, dan pindah.' },
]

/** Hero typewriter — session-aware delay */
const HERO_FULL = 'Buku data warga, sekarang di web.'
const heroTyped = ref('')
const heroDone = ref(false)
const heroBadge = 'Padukuhan Jetis Sumur · DI Yogyakarta'

onMounted(async () => {
  const hadPreloader = sessionStorage.getItem('jetis-preloader-v4') === '1'
  await new Promise((r) => setTimeout(r, hadPreloader ? 100 : 1700))
  for (let i = 1; i <= HERO_FULL.length; i++) {
    heroTyped.value = HERO_FULL.slice(0, i)
    await new Promise((r) => setTimeout(r, HERO_FULL[i - 1] === ' ' ? 38 : 26))
  }
  heroDone.value = true
})
</script>
