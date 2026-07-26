<template>
  <div>
    <div v-if="!auth.loaded" class="muted text-sm">Memuat sesi…</div>

    <!-- Login -->
    <div v-else-if="!auth.user" class="max-w-md mx-auto card p-6">
      <h1 class="font-display text-2xl font-bold">Masuk pengelola</h1>
      <p class="text-sm muted mt-1">
        Hanya perangkat padukuhan. Halaman ini tidak ditampilkan di menu publik.
      </p>
      <form class="mt-6 space-y-3" @submit.prevent="onLogin">
        <div>
          <label class="label">Username</label>
          <input v-model="form.username" class="input" autocomplete="username" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            autocomplete="current-password"
            required
            minlength="8"
          />
        </div>
        <p v-if="error" class="text-sm" style="color: var(--danger)">{{ error }}</p>
        <button class="btn btn-primary w-full" type="submit" :disabled="loading">
          {{ loading ? 'Masuk…' : 'Masuk' }}
        </button>
      </form>
      <p class="text-xs muted mt-4">
        Kredensial diberikan pengelola sistem. Jangan bagikan password di chat publik.
      </p>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Ringkasan</h1>
          <p class="muted text-sm mt-1">
            Mode {{ stats?.mode || '…' }} ·
            <span class="badge-role align-middle" :class="roleBadgeClass">{{ roleLabel }}</span>
            · {{ auth.user.nama }}
            <span v-if="auth.user.tenantId"> · {{ auth.user.tenantId }}</span>
            <span v-if="auth.user.rtScope?.length"> · RT {{ auth.user.rtScope.join(', ') }}</span>
            · portal {{ stats?.portalPending || 0 }} · surat draft {{ stats?.suratPending || 0 }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink class="btn btn-ghost text-sm" to="/ops/cari">Cari</NuxtLink>
          <NuxtLink class="btn btn-ghost text-sm" to="/ops/portal">Portal</NuxtLink>
          <a class="btn btn-ghost text-sm" href="/api/print?type=pejabat" target="_blank" rel="noopener">
            Laporan pejabat
          </a>
          <NuxtLink class="btn btn-primary text-sm" to="/ops/surat">Surat + QR</NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div v-for="s in cards" :key="s.label" class="card p-4">
          <div class="text-xs muted">{{ s.label }}</div>
          <div class="stat-num text-2xl mt-1">{{ formatNum(s.value) }}</div>
        </div>
      </div>

      <div class="grid gap-4 mt-6 lg:grid-cols-3">
        <div class="card p-5">
          <h2 class="font-semibold mb-3">Mutasi</h2>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>Masuk: <strong>{{ stats?.masuk || 0 }}</strong></div>
            <div>Keluar: <strong>{{ stats?.keluar || 0 }}</strong></div>
            <div>Lahir: <strong>{{ stats?.lahir || 0 }}</strong></div>
            <div>Meninggal: <strong>{{ stats?.meninggal || 0 }}</strong></div>
            <div>Pindah datang: <strong>{{ stats?.pindahDatang || 0 }}</strong></div>
            <div>Pindah keluar: <strong>{{ stats?.pindahKeluar || 0 }}</strong></div>
            <div class="col-span-2 pt-1 muted text-xs">30 hari: {{ stats?.mutasiBulanIni || 0 }}</div>
          </div>
        </div>
        <div class="card p-5">
          <h2 class="font-semibold mb-3">Mutasi terbaru</h2>
          <ul class="space-y-2 text-sm max-h-64 overflow-auto">
            <li
              v-for="m in stats?.recentMutasi || []"
              :key="m.id"
              class="border-b pb-2"
              style="border-color: var(--border)"
            >
              <div class="font-medium">{{ m.nama || m.nik }} · {{ m.jenis }}</div>
              <div class="text-xs muted">{{ m.tanggal }}</div>
            </li>
            <li v-if="!(stats?.recentMutasi || []).length" class="muted">Belum ada mutasi.</li>
          </ul>
        </div>
        <div class="card p-5">
          <h2 class="font-semibold mb-3">Aktivitas terbaru</h2>
          <ul class="space-y-2 text-sm max-h-64 overflow-auto">
            <li
              v-for="l in stats?.recentLogs || []"
              :key="l.id"
              class="border-b pb-2"
              style="border-color: var(--border)"
            >
              <div class="font-medium">{{ l.human || l.aktivitas }}</div>
              <div class="text-xs muted">{{ l.user }} · {{ l.waktu }}</div>
            </li>
            <li v-if="!(stats?.recentLogs || []).length" class="muted">Belum ada log.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops' })

const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const stats = ref<any>(null)

function formatNum(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('id-ID')
}

async function loadStats() {
  if (!auth.user) return
  const res = await $fetch<{ ok: boolean; stats: any }>('/api/stats?admin=1')
  stats.value = res.stats
}

const cards = computed(() => [
  { label: 'Penduduk', value: stats.value?.totalPenduduk },
  { label: 'KK', value: stats.value?.totalKk },
  { label: 'Laki-laki', value: stats.value?.laki },
  { label: 'Perempuan', value: stats.value?.perempuan },
])

const roleLabel = computed(() => {
  const r = auth.user?.role
  if (r === 'super_admin') return 'Super Admin'
  if (r === 'admin') return 'Admin'
  return 'Padukuhan'
})

const roleBadgeClass = computed(() => {
  const r = auth.user?.role
  if (r === 'super_admin') return 'badge-role--super'
  if (r === 'admin') return 'badge-role--admin'
  return 'badge-role--padukuhan'
})

async function onLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.username, form.password)
    form.password = ''
    await loadStats()
  } catch (e: any) {
    const code = e?.data?.statusMessage || e?.statusMessage || ''
    if (code === 'too_many_attempts') error.value = 'Terlalu banyak percobaan. Coba lagi nanti.'
    else if (code === 'invalid_credentials') error.value = 'Username atau password salah.'
    else error.value = 'Login gagal.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (auth.user) await loadStats()
})
</script>
