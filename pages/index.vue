<template>
  <div>
    <!-- Hero -->
    <section class="container-page py-10 sm:py-14">
      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div>
          <p class="badge mb-3">Padukuhan Jetis Sumur</p>
          <h1 class="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Buku data warga, diganti ke web.
          </h1>
          <p class="mt-3 muted max-w-xl">
            Sistem informasi pendataan penduduk padukuhan: statistik publik real-time, dashboard pengelola berjenjang, dan data tersimpan di Google Spreadsheet.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/statistik" class="btn btn-primary">Lihat statistik</NuxtLink>
            <NuxtLink to="/profil" class="btn btn-ghost">Profil padukuhan</NuxtLink>
          </div>
        </div>

        <div class="card p-5 grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs muted uppercase tracking-wide">Penduduk</div>
            <div class="stat-num">{{ formatNum(stats?.totalPenduduk) }}</div>
          </div>
          <div>
            <div class="text-xs muted uppercase tracking-wide">Kartu Keluarga</div>
            <div class="stat-num">{{ formatNum(stats?.totalKk) }}</div>
          </div>
          <div>
            <div class="text-xs muted uppercase tracking-wide">Laki-laki</div>
            <div class="stat-num text-xl">{{ formatNum(stats?.laki) }}</div>
          </div>
          <div>
            <div class="text-xs muted uppercase tracking-wide">Perempuan</div>
            <div class="stat-num text-xl">{{ formatNum(stats?.perempuan) }}</div>
          </div>
          <div class="col-span-2 text-xs muted border-t pt-3" style="border-color: var(--border)">
            Mode data: <strong>{{ stats?.mode || '…' }}</strong> · data pribadi disembunyikan
          </div>
        </div>
      </div>
    </section>

    <!-- Umur bands -->
    <section class="container-page pb-10">
      <h2 class="font-display text-xl font-bold mb-4">Kelompok umur</h2>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div v-for="b in ageBands" :key="b.label" class="card p-4">
          <div class="text-xs muted">{{ b.label }}</div>
          <div class="stat-num text-2xl mt-1">{{ formatNum(b.value) }}</div>
        </div>
      </div>
    </section>

    <!-- RT -->
    <section class="container-page pb-10">
      <h2 class="font-display text-xl font-bold mb-4">Penduduk per RT</h2>
      <div class="card overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>RT</th>
                <th>KK</th>
                <th>Jiwa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in stats?.perRt || []" :key="r.rt">
                <td>RT {{ r.rt }}</td>
                <td>{{ r.kk }}</td>
                <td>{{ r.jiwa }}</td>
              </tr>
              <tr v-if="!(stats?.perRt || []).length">
                <td colspan="3" class="muted">Belum ada data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Berita -->
    <section class="container-page pb-14">
      <div class="flex items-end justify-between mb-4">
        <h2 class="font-display text-xl font-bold">Berita</h2>
        <NuxtLink to="/berita" class="text-sm" style="color: var(--accent)">Semua →</NuxtLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <article v-for="b in berita.slice(0, 2)" :key="b.id" class="card p-5">
          <div class="text-xs muted">{{ b.tanggal }}</div>
          <h3 class="font-semibold mt-1">{{ b.judul }}</h3>
          <p class="text-sm muted mt-2">{{ b.ringkas }}</p>
        </article>
        <div v-if="!berita.length" class="card p-5 muted text-sm">Belum ada berita.</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Beranda' })

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
</script>
