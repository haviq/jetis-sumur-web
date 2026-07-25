<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 hero-grid opacity-40 pointer-events-none" />
      <div class="container-page relative py-12 sm:py-16">
        <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div class="reveal reveal-d1">
            <p class="badge mb-4 tracking-[0.12em]">{{ heroBadge }}</p>
            <h1 class="font-display text-[2rem] sm:text-4xl lg:text-[2.6rem] font-bold leading-[1.15]">
              <span class="hero-type">{{ heroTyped }}</span><span
                v-if="!heroDone"
                class="hero-caret"
                aria-hidden="true"
              />
            </h1>
            <p class="mt-4 muted max-w-xl text-[15px] leading-relaxed reveal reveal-d2">
              Statistik padukuhan yang bisa dilihat warga, dan dashboard pengelola untuk KK, jiwa, serta mutasi —
              datanya tersimpan di spreadsheet, bukan di kertas.
            </p>
            <div class="mt-7 flex flex-wrap gap-3 reveal reveal-d3">
              <NuxtLink to="/statistik" class="btn btn-primary">Lihat statistik</NuxtLink>
              <NuxtLink to="/profil" class="btn btn-ghost">Profil padukuhan</NuxtLink>
            </div>
            <p class="mt-5 text-xs muted">
              NIK, nama, dan nomor HP tidak dipublikasikan.
            </p>
          </div>

          <div class="card p-5 sm:p-6 reveal reveal-d2">
            <div class="flex items-center justify-between mb-4">
              <div class="text-sm font-semibold">Ringkasan penduduk</div>
              <span class="badge">{{ stats?.mode || '…' }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-[11px] uppercase tracking-wide muted">Penduduk</div>
                <div class="stat-num mt-1">{{ formatNum(stats?.totalPenduduk) }}</div>
              </div>
              <div>
                <div class="text-[11px] uppercase tracking-wide muted">Kartu Keluarga</div>
                <div class="stat-num mt-1">{{ formatNum(stats?.totalKk) }}</div>
              </div>
              <div>
                <div class="text-[11px] uppercase tracking-wide muted">Laki-laki</div>
                <div class="stat-num text-2xl mt-1">{{ formatNum(stats?.laki) }}</div>
              </div>
              <div>
                <div class="text-[11px] uppercase tracking-wide muted">Perempuan</div>
                <div class="stat-num text-2xl mt-1">{{ formatNum(stats?.perempuan) }}</div>
              </div>
            </div>
            <div class="mt-5 pt-4 border-t text-xs muted" style="border-color: var(--border)">
              Diperbarui dari data pengelola padukuhan
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Age -->
    <section class="container-page pb-12">
      <div class="flex items-end justify-between gap-3 mb-4">
        <h2 class="section-title">Kelompok umur</h2>
        <NuxtLink to="/statistik" class="text-sm" style="color: var(--accent)">Detail →</NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          v-for="(b, i) in ageBands"
          :key="b.label"
          class="card card-hover p-4 reveal"
          :class="`reveal-d${Math.min(i + 1, 5)}`"
        >
          <div class="text-xs muted">{{ b.label }}</div>
          <div class="stat-num text-2xl mt-1.5">{{ formatNum(b.value) }}</div>
        </div>
      </div>
    </section>

    <!-- RT bars -->
    <section class="container-page pb-12">
      <h2 class="section-title mb-4">Penduduk per RT</h2>
      <div class="card p-5 reveal reveal-d2">
        <div class="space-y-3">
          <div v-for="r in stats?.perRt || []" :key="r.rt" class="grid grid-cols-[4rem_1fr_3rem] items-center gap-3 text-sm">
            <span class="muted font-medium">RT {{ r.rt }}</span>
            <div class="bar"><i :style="{ width: barWidth(r.jiwa) + '%' }" /></div>
            <span class="text-right font-semibold">{{ r.jiwa }}</span>
          </div>
          <p v-if="!(stats?.perRt || []).length" class="muted text-sm">Belum ada data.</p>
        </div>
      </div>
    </section>

    <!-- Layanan -->
    <section class="container-page pb-12">
      <h2 class="section-title mb-4">Yang tersedia di web ini</h2>
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="(f, i) in features"
          :key="f.t"
          class="card card-hover p-5 reveal"
          :class="`reveal-d${i + 1}`"
        >
          <div class="text-lg mb-2" aria-hidden="true">{{ f.i }}</div>
          <div class="font-semibold">{{ f.t }}</div>
          <p class="text-sm muted mt-1.5 leading-relaxed">{{ f.d }}</p>
        </div>
      </div>
    </section>

    <!-- Berita -->
    <section class="container-page pb-16">
      <div class="flex items-end justify-between mb-4">
        <h2 class="section-title">Berita padukuhan</h2>
        <NuxtLink to="/berita" class="text-sm" style="color: var(--accent)">Semua →</NuxtLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <article
          v-for="(b, i) in berita.slice(0, 2)"
          :key="b.id"
          class="card card-hover p-5 reveal"
          :class="`reveal-d${i + 1}`"
        >
          <div class="text-xs muted">{{ b.tanggal }}</div>
          <h3 class="font-semibold mt-1.5 text-[1.05rem]">{{ b.judul }}</h3>
          <p class="text-sm muted mt-2 leading-relaxed">{{ b.ringkas }}</p>
        </article>
        <div v-if="!berita.length" class="card p-5 muted text-sm">Belum ada berita.</div>
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

const ageBands = computed(() => [
  { label: 'Balita (0–5)', value: stats.value?.balita },
  { label: 'Anak (6–12)', value: stats.value?.anak },
  { label: 'Remaja (13–17)', value: stats.value?.remaja },
  { label: 'Dewasa (18–59)', value: stats.value?.dewasa },
  { label: 'Lansia (60+)', value: stats.value?.lansia },
])

const maxJiwa = computed(() =>
  Math.max(1, ...((stats.value?.perRt || []).map((r: any) => Number(r.jiwa) || 0))),
)
function barWidth(n: number) {
  return Math.round((Number(n || 0) / maxJiwa.value) * 100)
}

const features = [
  { i: '📊', t: 'Statistik publik', d: 'Jumlah jiwa, KK, demografi per RT — tanpa data pribadi.' },
  { i: '👨‍👩‍👧‍👦', t: 'Pendataan KK & jiwa', d: 'Pengelola input lewat dashboard terproteksi, bukan menu publik.' },
  { i: '🔁', t: 'Mutasi warga', d: 'Catat masuk, keluar, lahir, meninggal, dan pindah.' },
]

/** Hero typewriter after preloader (session-aware delay) */
const HERO_FULL = 'Buku data warga, sekarang di web.'
const heroTyped = ref('')
const heroDone = ref(false)
const heroBadge = 'Padukuhan Jetis Sumur · DI Yogyakarta'

onMounted(async () => {
  // Wait a beat so preloader can finish first paint on cold load
  const hadPreloader = sessionStorage.getItem('jetis-preloader') === '1'
  await new Promise((r) => setTimeout(r, hadPreloader ? 120 : 1600))
  for (let i = 1; i <= HERO_FULL.length; i++) {
    heroTyped.value = HERO_FULL.slice(0, i)
    await new Promise((r) => setTimeout(r, HERO_FULL[i - 1] === ' ' ? 40 : 28))
  }
  heroDone.value = true
})
</script>
