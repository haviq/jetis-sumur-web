<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Statistik Penduduk</h1>
    <p class="muted mt-2">Agregat real-time. Tanpa data pribadi.</p>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
      <div v-for="s in top" :key="s.label" class="card p-4">
        <div class="text-xs muted">{{ s.label }}</div>
        <div class="stat-num text-2xl mt-1">{{ formatNum(s.value) }}</div>
      </div>
    </div>

    <div class="grid gap-4 mt-8 lg:grid-cols-2">
      <div class="card p-5">
        <h2 class="font-semibold mb-3">Per RT</h2>
        <div class="space-y-2">
          <div v-for="r in stats?.perRt || []" :key="r.rt" class="flex items-center gap-3 text-sm">
            <span class="w-14 muted">RT {{ r.rt }}</span>
            <div class="flex-1 h-2 rounded-full overflow-hidden" style="background: var(--surface-soft)">
              <div class="h-full rounded-full" :style="{ width: bar(r.jiwa) + '%', background: 'var(--accent)' }" />
            </div>
            <span class="w-10 text-right font-semibold">{{ r.jiwa }}</span>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Agama</h2>
        <ul class="space-y-2 text-sm">
          <li v-for="a in stats?.agama || []" :key="a.label" class="flex justify-between">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </li>
        </ul>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Pendidikan</h2>
        <ul class="space-y-2 text-sm">
          <li v-for="a in stats?.pendidikan || []" :key="a.label" class="flex justify-between">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </li>
        </ul>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Pekerjaan</h2>
        <ul class="space-y-2 text-sm">
          <li v-for="a in stats?.pekerjaan || []" :key="a.label" class="flex justify-between">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Statistik' })
const { data } = await useFetch<{ ok: boolean; stats: any }>('/api/stats')
const stats = computed(() => data.value?.stats)
const top = computed(() => [
  { label: 'Total penduduk', value: stats.value?.totalPenduduk },
  { label: 'Total KK', value: stats.value?.totalKk },
  { label: 'Laki-laki', value: stats.value?.laki },
  { label: 'Perempuan', value: stats.value?.perempuan },
])
const maxJiwa = computed(() => Math.max(1, ...(stats.value?.perRt || []).map((r: any) => r.jiwa)))
function bar(n: number) {
  return Math.round((n / maxJiwa.value) * 100)
}
</script>
