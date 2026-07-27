<template>
  <div class="container-page py-10 sm:py-12">
    <div class="max-w-2xl">
      <h1 class="font-display text-3xl font-bold">Statistik Penduduk</h1>
      <p class="muted mt-2">Agregat real-time dari data pengelola. Tanpa NIK, nama, atau nomor HP.</p>
    </div>

    <!-- ── SKELETON: top cards ── -->
    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
      <SkeletonCard v-for="i in 4" :key="i" :lines="2" :show-header="false" />
    </div>

    <!-- ── TOP STATS ── -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
      <div v-for="s in top" :key="s.label" class="card card-hover p-4">
        <div class="text-xs muted">{{ s.label }}</div>
        <div class="stat-num text-2xl mt-1">{{ formatNum(s.value) }}</div>
      </div>
    </div>

    <!-- ── SKELETON: charts grid ── -->
    <div v-if="pending" class="grid gap-4 mt-8 lg:grid-cols-2">
      <SkeletonCard v-for="i in 5" :key="i" :lines="5" :class="i === 5 ? 'lg:col-span-2' : ''" />
    </div>

    <!-- ── CHARTS GRID ── -->
    <div v-else class="grid gap-4 mt-8 lg:grid-cols-2">

      <!-- Per RT bar chart -->
      <div class="card p-5">
        <h2 class="font-semibold mb-4">Per RT</h2>
        <div class="space-y-3">
          <div
            v-for="r in stats?.perRt || []"
            :key="r.rt"
            class="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-sm"
          >
            <span class="muted">RT {{ r.rt }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: bar(r.jiwa) + '%' }"
                :title="`RT ${r.rt}: ${r.jiwa} jiwa (${bar(r.jiwa)}%)`"
              />
            </div>
            <span class="text-right font-semibold tabular-nums">{{ r.jiwa }}</span>
          </div>
        </div>
      </div>

      <!-- Kelompok umur -->
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Kelompok umur</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="b in age"
            :key="b.label"
            class="rounded-lg p-3"
            style="background: var(--surface-soft)"
          >
            <div class="text-xs muted">{{ b.label }}</div>
            <div class="stat-num text-xl mt-1">{{ formatNum(b.value) }}</div>
          </div>
        </div>
      </div>

      <!-- Agama — donut simulasi CSS -->
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Agama</h2>
        <ul class="space-y-2.5 text-sm">
          <li
            v-for="a in stats?.agama || []"
            :key="a.label"
            class="flex flex-col gap-1"
          >
            <div class="flex justify-between">
              <span class="muted">{{ a.label }}</span>
              <span class="font-semibold tabular-nums">{{ a.count }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill bar-fill--accent2"
                :style="{ width: pct(a.count, totalAgama) + '%' }"
              />
            </div>
          </li>
        </ul>
      </div>

      <!-- Pendidikan — donut simulasi CSS -->
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Pendidikan</h2>
        <ul class="space-y-2.5 text-sm">
          <li
            v-for="a in stats?.pendidikan || []"
            :key="a.label"
            class="flex flex-col gap-1"
          >
            <div class="flex justify-between">
              <span class="muted">{{ a.label }}</span>
              <span class="font-semibold tabular-nums">{{ a.count }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill bar-fill--accent2"
                :style="{ width: pct(a.count, totalPendidikan) + '%' }"
              />
            </div>
          </li>
        </ul>
      </div>

      <!-- Pekerjaan -->
      <div class="card p-5 lg:col-span-2">
        <h2 class="font-semibold mb-3">Pekerjaan</h2>
        <div class="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div
            v-for="a in stats?.pekerjaan || []"
            :key="a.label"
            class="flex justify-between gap-3 border-b py-2"
            style="border-color: var(--border)"
          >
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold tabular-nums">{{ a.count }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Statistik',
  meta: [
    {
      name: 'description',
      content: 'Statistik kependudukan real-time Padukuhan Jetis Sumur — jumlah jiwa, KK, per RT, kelompok umur',
    },
    { property: 'og:title', content: 'Statistik Penduduk · Jetis Sumur' },
    {
      property: 'og:description',
      content: 'Agregat real-time jumlah penduduk, KK, kelompok umur, agama, pendidikan, dan pekerjaan Padukuhan Jetis Sumur.',
    },
    { property: 'og:type', content: 'website' },
  ],
})

const { data, pending } = await useFetch<{ ok: boolean; stats: any }>('/api/stats')
const stats = computed(() => data.value?.stats)

const top = computed(() => [
  { label: 'Total penduduk', value: stats.value?.totalPenduduk },
  { label: 'Total KK',       value: stats.value?.totalKk },
  { label: 'Laki-laki',      value: stats.value?.laki },
  { label: 'Perempuan',      value: stats.value?.perempuan },
])

const age = computed(() => [
  { label: 'Balita', value: stats.value?.balita },
  { label: 'Anak',   value: stats.value?.anak },
  { label: 'Remaja', value: stats.value?.remaja },
  { label: 'Dewasa', value: stats.value?.dewasa },
  { label: 'Lansia', value: stats.value?.lansia },
])

const maxJiwa = computed(() =>
  Math.max(1, ...(stats.value?.perRt || []).map((r: any) => r.jiwa || 0)),
)

const totalAgama = computed(() =>
  (stats.value?.agama || []).reduce((s: number, a: any) => s + (Number(a.count) || 0), 0),
)

const totalPendidikan = computed(() =>
  (stats.value?.pendidikan || []).reduce((s: number, a: any) => s + (Number(a.count) || 0), 0),
)

function bar(n: number): number {
  return Math.round((Number(n || 0) / maxJiwa.value) * 100)
}

function pct(count: number, total: number): number {
  if (!total) return 0
  return Math.round((Number(count || 0) / total) * 100)
}

function formatNum(n: number | undefined): string {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('id-ID')
}
</script>

<style scoped>
/* ── Horizontal bar track ── */
.bar-track {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-soft);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 2px;
}

.bar-fill--accent2 {
  background: var(--accent-2);
}
</style>
