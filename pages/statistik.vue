<template>
  <div class="container-page py-10 sm:py-12">
    <div class="max-w-2xl">
      <h1 class="font-display text-3xl font-bold">Statistik Penduduk</h1>
      <p class="muted mt-2">Agregat real-time dari data pengelola. Tanpa NIK, nama, atau nomor HP.</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
      <div v-for="s in top" :key="s.label" class="card card-hover p-4">
        <div class="text-xs muted">{{ s.label }}</div>
        <div class="stat-num text-2xl mt-1">{{ formatNum(s.value) }}</div>
      </div>
    </div>

    <div class="grid gap-4 mt-8 lg:grid-cols-2">
      <div class="card p-5">
        <h2 class="font-semibold mb-4">Per RT</h2>
        <div class="space-y-3">
          <div v-for="r in stats?.perRt || []" :key="r.rt" class="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-sm">
            <span class="muted">RT {{ r.rt }}</span>
            <div class="bar"><i :style="{ width: bar(r.jiwa) + '%' }" /></div>
            <span class="text-right font-semibold">{{ r.jiwa }}</span>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Kelompok umur</h2>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="b in age" :key="b.label" class="rounded-lg p-3" style="background: var(--surface-soft)">
            <div class="text-xs muted">{{ b.label }}</div>
            <div class="stat-num text-xl mt-1">{{ formatNum(b.value) }}</div>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Agama</h2>
        <ul class="space-y-2.5 text-sm">
          <li v-for="a in stats?.agama || []" :key="a.label" class="flex justify-between gap-3">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </li>
        </ul>
      </div>

      <div class="card p-5">
        <h2 class="font-semibold mb-3">Pendidikan</h2>
        <ul class="space-y-2.5 text-sm">
          <li v-for="a in stats?.pendidikan || []" :key="a.label" class="flex justify-between gap-3">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </li>
        </ul>
      </div>

      <div class="card p-5 lg:col-span-2">
        <h2 class="font-semibold mb-3">Pekerjaan</h2>
        <div class="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div v-for="a in stats?.pekerjaan || []" :key="a.label" class="flex justify-between gap-3 border-b py-2" style="border-color: var(--border)">
            <span class="muted">{{ a.label }}</span>
            <span class="font-semibold">{{ a.count }}</span>
          </div>
        </div>
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
const age = computed(() => [
  { label: 'Balita', value: stats.value?.balita },
  { label: 'Anak', value: stats.value?.anak },
  { label: 'Remaja', value: stats.value?.remaja },
  { label: 'Dewasa', value: stats.value?.dewasa },
  { label: 'Lansia', value: stats.value?.lansia },
])
const maxJiwa = computed(() => Math.max(1, ...(stats.value?.perRt || []).map((r: any) => r.jiwa || 0)))
function bar(n: number) {
  return Math.round((Number(n || 0) / maxJiwa.value) * 100)
}
</script>
