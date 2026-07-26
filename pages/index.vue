<template>
  <div>
    <!-- ── Hero ── -->
    <section class="hero-section relative overflow-hidden">
      <div class="absolute inset-0 hero-grid opacity-35 pointer-events-none" />
      <div class="hero-lines" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div class="container-page relative py-12 sm:py-16">
        <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <!-- Left: copy -->
          <div class="reveal reveal-d1">
            <p class="hero-badge mb-5">
              <span class="hero-badge__dot" />
              Padukuhan Jetis Sumur · DI Yogyakarta
            </p>

            <h1 class="font-display text-[2rem] sm:text-[2.6rem] lg:text-[3rem] font-bold leading-[1.13] tracking-tight">
              Padukuhan Jetis Sumur
            </h1>

            <p class="mt-4 text-[15px] leading-relaxed max-w-lg reveal reveal-d2" style="color: var(--muted)">
              Pendataan warga, statistik kependudukan, dan layanan administrasi padukuhan.
            </p>

            <div class="mt-7 flex flex-wrap gap-3 reveal reveal-d3">
              <NuxtLink to="/statistik" class="btn btn-primary btn-lg">
                Lihat statistik
                <span aria-hidden="true" class="ml-1.5">→</span>
              </NuxtLink>
              <NuxtLink to="/profil" class="btn btn-ghost btn-lg">
                Profil padukuhan
              </NuxtLink>
            </div>

            <p class="mt-4 text-xs reveal reveal-d4" style="color: var(--muted2)">
              NIK, nama, dan nomor HP tidak dipublikasikan.
            </p>
          </div>

          <!-- Right: stats card -->
          <div class="stats-card reveal reveal-d2">
            <div class="stats-card__header">
              <span class="font-semibold text-sm">Ringkasan penduduk</span>
              <span class="badge badge--mode">{{ stats?.mode || 'live' }}</span>
            </div>

            <div class="stats-card__grid">
              <div class="stat-cell stat-cell--featured">
                <div class="stat-cell__label">Total jiwa</div>
                <div class="stat-num">{{ formatNum(stats?.totalPenduduk) }}</div>
                <div class="stat-cell__sub">terdaftar</div>
              </div>
              <div class="stat-cell stat-cell--featured">
                <div class="stat-cell__label">Kartu Keluarga</div>
                <div class="stat-num">{{ formatNum(stats?.totalKk) }}</div>
                <div class="stat-cell__sub">KK aktif</div>
              </div>
              <div class="stat-cell">
                <div class="stat-cell__label">Rukun Tetangga</div>
                <div class="stat-num text-2xl">{{ formatNum(stats?.perRt?.length) }}</div>
              </div>
              <div class="stat-cell">
                <div class="stat-cell__label">L / P</div>
                <div class="stat-num text-xl">
                  {{ formatNum(stats?.laki) }} / {{ formatNum(stats?.perempuan) }}
                </div>
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

    <!-- ── Statistik: Per RT ── -->
    <section class="container-page py-12 sm:py-14">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Penduduk per RT</h2>
        <NuxtLink to="/statistik" class="section-more">Statistik lengkap →</NuxtLink>
      </div>

      <div class="grid gap-4 lg:grid-cols-2 reveal reveal-d2">
        <!-- Bar chart per RT -->
        <div class="card p-5 sm:p-6">
          <h3 class="text-sm font-semibold mb-4" style="color: var(--muted)">Jumlah jiwa</h3>
          <div class="space-y-3.5">
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
            <p v-if="!(stats?.perRt || []).length" class="text-sm" style="color: var(--muted)">
              Belum ada data.
            </p>
          </div>
        </div>

        <!-- Kelompok umur 3x2 grid -->
        <div class="card p-5 sm:p-6">
          <h3 class="text-sm font-semibold mb-4" style="color: var(--muted)">Kelompok umur</h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="b in ageBands"
              :key="b.label"
              class="age-card"
            >
              <div class="age-card__label">{{ b.label }}</div>
              <div class="stat-num text-xl mt-2">{{ formatNum(b.value) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Berita ── -->
    <section class="container-page pb-20">
      <div class="section-header reveal reveal-d1">
        <h2 class="section-title">Berita padukuhan</h2>
        <NuxtLink to="/berita" class="section-more">Lihat semua →</NuxtLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <article
          v-for="(b, i) in berita.slice(0, 3)"
          :key="b.id"
          class="berita-card card card-hover p-5 reveal"
          :class="`reveal-d${i + 1}`"
        >
          <div class="text-xs mb-2" style="color: var(--muted2)">{{ b.tanggal }}</div>
          <h3 class="font-semibold text-[1rem] leading-snug">{{ b.judul }}</h3>
          <p class="text-sm mt-2 leading-relaxed" style="color: var(--muted)">{{ b.ringkas }}</p>
        </article>
        <div v-if="!berita.length" class="card p-5 text-sm sm:col-span-3" style="color: var(--muted)">
          Belum ada berita.
        </div>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="border-t py-8" style="border-color: var(--border)">
      <div class="container-page flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm" style="color: var(--muted2)">
        <div>
          <span class="font-semibold" style="color: var(--muted)">Padukuhan Jetis Sumur</span>
          <span class="mx-2 opacity-40">·</span>
          <span>Desa Sumberharjo, Prambanan, Sleman, DI Yogyakarta</span>
        </div>
        <span>© {{ new Date().getFullYear() }} Padukuhan Jetis Sumur</span>
      </div>
    </footer>
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
</script>
