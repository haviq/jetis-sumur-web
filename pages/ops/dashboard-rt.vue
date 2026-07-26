<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>

    <div v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="font-display text-2xl font-bold">Dashboard RT</h1>
          <p class="text-sm muted mt-1">
            Ringkasan per Rukun Tetangga
            <span v-if="auth.user.rtScope?.length">
              · Akses RT {{ auth.user.rtScope.join(', ') }}
            </span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a
            class="btn btn-ghost text-sm"
            href="/api/export-excel?type=rekap"
            target="_blank"
            rel="noopener"
          >
            ↓ Export Excel
          </a>
          <NuxtLink class="btn btn-primary text-sm" to="/ops/warga">
            Data Warga
          </NuxtLink>
        </div>
      </div>

      <!-- Summary banner -->
      <div v-if="stats" class="card p-4 mb-6 flex flex-wrap gap-6">
        <div class="text-center">
          <div class="font-display text-3xl font-bold" style="color: var(--accent)">
            {{ stats.totalPenduduk }}
          </div>
          <div class="text-xs muted mt-1">Total Jiwa Aktif</div>
        </div>
        <div class="text-center">
          <div class="font-display text-3xl font-bold">{{ stats.totalKk }}</div>
          <div class="text-xs muted mt-1">Kartu Keluarga</div>
        </div>
        <div class="text-center">
          <div class="font-display text-3xl font-bold" style="color: var(--emerald, #10b981)">
            {{ stats.laki }}
          </div>
          <div class="text-xs muted mt-1">Laki-laki</div>
        </div>
        <div class="text-center">
          <div class="font-display text-3xl font-bold" style="color: var(--pink, #ec4899)">
            {{ stats.perempuan }}
          </div>
          <div class="text-xs muted mt-1">Perempuan</div>
        </div>
        <div class="text-center">
          <div class="font-display text-2xl font-bold">{{ visibleRts.length }}</div>
          <div class="text-xs muted mt-1">RT Aktif</div>
        </div>
      </div>

      <!-- Filter dropdown -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label class="text-sm font-medium">Filter RT:</label>
        <select v-model="filterRt" class="input text-sm" style="width: auto; min-width: 120px">
          <option value="">Semua RT</option>
          <option v-for="r in allRts" :key="r" :value="r">RT {{ r }}</option>
        </select>
        <span class="text-sm muted">
          {{ filteredRts.length }} RT ditampilkan
        </span>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="muted text-sm py-8 text-center">Memuat data RT…</div>

      <!-- Error -->
      <div v-else-if="error" class="card p-4 text-sm" style="color: var(--danger)">
        Gagal memuat data: {{ error }}
      </div>

      <!-- RT Cards grid -->
      <div
        v-else-if="filteredRts.length"
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))"
      >
        <div
          v-for="rt in filteredRts"
          :key="rt.rt"
          class="card p-5 flex flex-col gap-3"
        >
          <!-- RT title + link -->
          <div class="flex items-start justify-between">
            <div>
              <div class="font-display text-lg font-bold">RT {{ rt.rt }}</div>
              <div class="text-xs muted">RW {{ rt.rw || '01' }}</div>
            </div>
            <NuxtLink
              :to="`/ops/warga?rt=${rt.rt}`"
              class="btn btn-ghost text-xs"
              style="padding: 4px 10px"
            >
              Lihat →
            </NuxtLink>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="font-bold text-lg">{{ rt.jiwa }}</div>
              <div class="text-xs muted">Jiwa</div>
            </div>
            <div>
              <div class="font-bold text-lg">{{ rt.kk }}</div>
              <div class="text-xs muted">KK</div>
            </div>
            <div>
              <div class="font-bold text-lg">
                {{ rt.jiwa > 0 ? (rt.kk > 0 ? (rt.jiwa / rt.kk).toFixed(1) : '—') : '0' }}
              </div>
              <div class="text-xs muted">Jiwa/KK</div>
            </div>
          </div>

          <!-- Gender bar -->
          <div v-if="rt.laki + rt.perempuan > 0">
            <div class="flex justify-between text-xs mb-1">
              <span style="color: var(--emerald, #10b981)">
                ♂ {{ rt.laki }} L
              </span>
              <span style="color: var(--pink, #ec4899)">
                {{ rt.perempuan }} P ♀
              </span>
            </div>
            <div
              class="w-full rounded-full overflow-hidden"
              style="height: 6px; background: var(--border, #e5e7eb)"
              role="img"
              :aria-label="`Laki ${rt.laki}, Perempuan ${rt.perempuan}`"
            >
              <div
                class="h-full rounded-full transition-all"
                style="background: var(--emerald, #10b981)"
                :style="{ width: genderPct(rt) + '%' }"
              />
            </div>
          </div>
          <div v-else class="text-xs muted">Data jenis kelamin tidak tersedia</div>

          <!-- Progress bar: jiwa vs total -->
          <div v-if="stats && stats.totalPenduduk > 0">
            <div class="flex justify-between text-xs mb-1">
              <span class="muted">Porsi jiwa</span>
              <span class="muted">{{ pctOfTotal(rt.jiwa) }}%</span>
            </div>
            <div
              class="w-full rounded-full overflow-hidden"
              style="height: 8px; background: var(--border, #e5e7eb)"
              role="img"
              :aria-label="`${rt.jiwa} dari ${stats.totalPenduduk} jiwa`"
            >
              <div
                class="h-full rounded-full transition-all"
                style="background: var(--accent)"
                :style="{ width: pctOfTotal(rt.jiwa) + '%' }"
              />
            </div>
          </div>

          <!-- Quick links -->
          <div class="flex gap-2 mt-1">
            <NuxtLink
              :to="`/ops/kk?rt=${rt.rt}`"
              class="text-xs"
              style="color: var(--accent)"
            >
              KK
            </NuxtLink>
            <span class="muted text-xs">·</span>
            <NuxtLink
              :to="`/ops/mutasi?rt=${rt.rt}`"
              class="text-xs"
              style="color: var(--accent)"
            >
              Mutasi
            </NuxtLink>
            <span class="muted text-xs">·</span>
            <a
              :href="`/api/export-excel?type=warga&rt=${rt.rt}`"
              class="text-xs"
              style="color: var(--accent)"
              target="_blank"
              rel="noopener"
            >
              CSV
            </a>
          </div>
        </div>
      </div>

      <div v-else class="card p-6 text-center muted text-sm">
        Tidak ada data RT yang tersedia.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Dashboard RT' })

const auth = useAuthStore()

interface RtRow {
  rt: string
  rw: string
  kk: number
  jiwa: number
  laki: number
  perempuan: number
}

interface StatsShape {
  totalPenduduk: number
  totalKk: number
  laki: number
  perempuan: number
  perRt: { rt: string; kk: number; jiwa: number }[]
  perRw: { rw: string; kk: number; jiwa: number }[]
}

const stats = ref<StatsShape | null>(null)
const pending = ref(false)
const error = ref('')
const filterRt = ref('')

// All warga items fetched once for per-RT gender breakdown
const wargaItems = ref<{ jk: string; nomorKk: string }[]>([])
// KK list for rt→rw mapping
const kkList = ref<{ nomorKk: string; rt: string; rw: string }[]>([])

// Compute per-RT rows with gender breakdown derived from warga list
const visibleRts = computed<RtRow[]>(() => {
  if (!stats.value) return []

  const scope = auth.user?.rtScope ?? []

  // Build nomorKk → rw map
  const kkRwMap = new Map<string, string>()
  for (const k of kkList.value) kkRwMap.set(k.nomorKk, k.rw)

  // Build nomorKk → rt map from KK list
  const kkRtMap = new Map<string, string>()
  for (const k of kkList.value) kkRtMap.set(k.nomorKk, k.rt)

  // Group warga by RT
  const lakiByRt = new Map<string, number>()
  const perempuanByRt = new Map<string, number>()
  for (const w of wargaItems.value) {
    const rt = kkRtMap.get(w.nomorKk)
    if (!rt) continue
    if (w.jk === 'L') lakiByRt.set(rt, (lakiByRt.get(rt) ?? 0) + 1)
    else perempuanByRt.set(rt, (perempuanByRt.get(rt) ?? 0) + 1)
  }

  // Build RW lookup from perRw — use KK list for accurate rt→rw
  const rtRwMap = new Map<string, string>()
  for (const k of kkList.value) {
    if (!rtRwMap.has(k.rt)) rtRwMap.set(k.rt, k.rw)
  }

  return stats.value.perRt
    .filter((r) => scope.length === 0 || scope.includes(r.rt))
    .map((r) => ({
      rt: r.rt,
      rw: rtRwMap.get(r.rt) ?? '01',
      kk: r.kk,
      jiwa: r.jiwa,
      laki: lakiByRt.get(r.rt) ?? 0,
      perempuan: perempuanByRt.get(r.rt) ?? 0,
    }))
    .sort((a, b) => a.rt.localeCompare(b.rt, undefined, { numeric: true }))
})

const allRts = computed(() => visibleRts.value.map((r) => r.rt))

const filteredRts = computed<RtRow[]>(() => {
  if (!filterRt.value) return visibleRts.value
  return visibleRts.value.filter((r) => r.rt === filterRt.value)
})

function genderPct(rt: RtRow): number {
  const total = rt.laki + rt.perempuan
  if (total === 0) return 0
  return Math.round((rt.laki / total) * 100)
}

function pctOfTotal(jiwa: number): number {
  if (!stats.value || stats.value.totalPenduduk === 0) return 0
  return Math.round((jiwa / stats.value.totalPenduduk) * 100)
}

async function loadData() {
  pending.value = true
  error.value = ''
  try {
    // Fetch stats (admin=1 for full AdminStats)
    const [statsRes, wargaRes, kkRes] = await Promise.all([
      $fetch<{ ok: boolean; stats: StatsShape }>('/api/stats?admin=1').catch(
        () => $fetch<{ ok: boolean; stats: StatsShape }>('/api/stats'),
      ),
      $fetch<{ ok: boolean; items: { jk: string; nomorKk: string }[] }>('/api/warga'),
      $fetch<{ ok: boolean; items: { nomorKk: string; rt: string; rw: string }[] }>('/api/keluarga'),
    ])

    stats.value = statsRes.stats
    wargaItems.value = wargaRes.items ?? []
    kkList.value = kkRes.items ?? []
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Gagal memuat'
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await loadData()
})
</script>
