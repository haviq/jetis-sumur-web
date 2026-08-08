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
          </p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="!stats" class="mt-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="card p-4 animate-pulse">
            <div class="h-4 bg-gray-300 rounded w-20 mb-2"></div>
            <div class="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>

      <div v-else class="stagger-in">
        <!-- Alert section -->
        <div
          v-if="(stats.portalPending || 0) > 0 || (stats.suratPending || 0) > 0"
          class="mt-4 card p-custom-card border-accent/30 bg-accent-glow"
        >
          <p class="text-sm font-semibold text-accent-bright flex items-center gap-2">
            <span>⚠️</span>
            <span>Perhatian:</span>
            <span v-if="stats.portalPending > 0">{{ stats.portalPending }} portal pending</span>
            <span v-if="stats.portalPending > 0 && stats.suratPending > 0"> · </span>
            <span v-if="stats.suratPending > 0">{{ stats.suratPending }} surat draft</span>
          </p>
        </div>

        <!-- Stats grid 4 kartu -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-custom-grid mt-6">
          <div class="card p-custom-card hover:border-accent/40 transition-all duration-300">
            <div class="text-xs muted">Total Jiwa</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-2xl">👥</span>
              <span class="stat-num text-3xl font-bold font-display" style="color: var(--accent-bright)">{{ formatNum(stats.totalPenduduk) }}</span>
            </div>
          </div>
          <div class="card p-custom-card hover:border-accent/40 transition-all duration-300">
            <div class="text-xs muted">Total KK</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-2xl">🏠</span>
              <span class="stat-num text-3xl font-bold font-display">{{ formatNum(stats.totalKk) }}</span>
            </div>
          </div>
          <div class="card p-custom-card hover:border-accent/40 transition-all duration-300">
            <div class="text-xs muted">Surat Pending</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-2xl">📄</span>
              <span class="stat-num text-3xl font-bold font-display text-warn">{{ formatNum(stats.suratPending) }}</span>
            </div>
          </div>
          <div class="card p-custom-card hover:border-accent/40 transition-all duration-300">
            <div class="text-xs muted">Portal Pending</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-2xl">📥</span>
              <span class="stat-num text-3xl font-bold font-display text-danger">{{ formatNum(stats.portalPending) }}</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="mt-6">
          <h2 class="font-semibold font-display text-lg mb-3">Aksi Cepat</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-custom-grid">
            <NuxtLink class="card p-custom-card hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg transition-all duration-300" to="/ops/keluarga">
              <div class="text-2xl mb-2">➕</div>
              <div class="font-medium text-sm">Tambah KK</div>
            </NuxtLink>
            <NuxtLink class="card p-custom-card hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg transition-all duration-300" to="/ops/surat">
              <div class="text-2xl mb-2">✍️</div>
              <div class="font-medium text-sm">Buat Surat</div>
            </NuxtLink>
            <NuxtLink class="card p-custom-card hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg transition-all duration-300" to="/ops/portal">
              <div class="text-2xl mb-2">👁️</div>
              <div class="font-medium text-sm">Lihat Portal</div>
            </NuxtLink>
            <a class="card p-custom-card hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg transition-all duration-300" href="/api/export?type=warga" target="_blank">
              <div class="text-2xl mb-2">📊</div>
              <div class="font-medium text-sm">Export CSV</div>
            </a>
          </div>
        </div>

        <!-- Grafik mini distribusi per RT -->
        <div class="card p-custom-card mt-6">
          <h2 class="font-semibold font-display text-lg mb-4">Distribusi per RT</h2>
          <div class="space-y-3">
            <div v-for="rt in stats.perRt || []" :key="rt.rt" class="flex items-center gap-3">
              <div class="text-sm font-medium w-12">RT {{ rt.rt }}</div>
              <div class="flex-1 bg-surface-soft rounded-full h-6 overflow-hidden relative border border-border/20">
                <div
                  class="h-full rounded-full flex items-center justify-end px-2 text-xs font-semibold text-black transition-all duration-700"
                  :style="{
                    width: maxRtJiwa > 0 ? `${(rt.jiwa / maxRtJiwa) * 100}%` : '0%',
                    background: 'var(--accent, #3b82f6)',
                    minWidth: rt.jiwa > 0 ? '40px' : '0',
                  }"
                >
                  {{ rt.jiwa }}
                </div>
              </div>
              <div class="text-xs muted w-16 text-right font-mono">{{ rt.kk }} KK</div>
            </div>
            <div v-if="!(stats.perRt || []).length" class="muted text-sm">Belum ada data RT.</div>
          </div>
        </div>

        <!-- Activity feed -->
        <div class="grid gap-custom-grid mt-6 lg:grid-cols-2">
          <div class="card p-custom-card">
            <h2 class="font-semibold font-display text-lg mb-3">Aktivitas Terbaru</h2>
            <ul class="space-y-2 text-sm max-h-64 overflow-auto">
              <li
                v-for="l in logs"
                :key="l.id"
                class="border-b pb-2"
                style="border-color: var(--border)"
              >
                <div class="font-medium">{{ l.human || l.aktivitas }}</div>
                <div class="text-xs muted">{{ l.user }} · {{ l.waktu }}</div>
              </li>
              <li v-if="!logs.length" class="muted">Belum ada log aktivitas.</li>
            </ul>
          </div>

          <div class="card p-custom-card">
            <h2 class="font-semibold font-display text-lg mb-3">Mutasi Terbaru</h2>
            <ul class="space-y-2 text-sm max-h-64 overflow-auto">
              <li
                v-for="m in stats.recentMutasi || []"
                :key="m.id"
                class="border-b pb-2"
                style="border-color: var(--border)"
              >
                <div class="font-medium">{{ m.nama || m.nik }} · {{ m.jenis }}</div>
                <div class="text-xs muted">{{ m.tanggal }}</div>
              </li>
              <li v-if="!(stats.recentMutasi || []).length" class="muted">Belum ada mutasi.</li>
            </ul>
          </div>
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
const logs = ref<any[]>([])

function formatNum(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('id-ID')
}

async function loadStats() {
  if (!auth.user) return
  try {
    const [statsRes, logsRes] = await Promise.all([
      $fetch<{ ok: boolean; stats: any }>('/api/stats?admin=1'),
      $fetch<{ ok: boolean; items: any[] }>('/api/logs').catch(() => ({ ok: true, items: [] })),
    ])
    stats.value = statsRes.stats
    logs.value = (logsRes.items || []).slice(0, 5)
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

const maxRtJiwa = computed(() => {
  if (!stats.value?.perRt) return 0
  return Math.max(...stats.value.perRt.map((rt: any) => rt.jiwa || 0), 1)
})

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
