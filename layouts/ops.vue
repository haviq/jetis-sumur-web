<template>
  <div class="min-h-screen" style="background: var(--bg)">
    <div class="border-b sticky top-0 z-30" style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(10px)">
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/ops" class="font-display font-bold truncate">Dashboard Pengelola</NuxtLink>
          <span v-if="auth.user" class="badge hidden sm:inline-flex">{{ roleLabel }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="auth.user"
            class="btn btn-ghost text-xs hidden sm:inline-flex"
            type="button"
            title="Ctrl+K"
            @click="goSearch"
          >
            ⌕ Cari
          </button>
          <span v-if="auth.user" class="hidden md:inline text-xs muted">{{ auth.user.nama }}</span>
          <button v-if="auth.user" class="btn btn-ghost text-xs" type="button" @click="onLogout">Keluar</button>
          <NuxtLink to="/" class="btn btn-ghost text-xs">Web publik</NuxtLink>
        </div>
      </div>
      <nav v-if="auth.user" class="container-page flex gap-1 overflow-x-auto pb-2.5">
        <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-link whitespace-nowrap">{{ t.label }}</NuxtLink>
      </nav>
    </div>
    <div class="container-page py-6 page-frame">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const roleLabel = computed(() => {
  const r = auth.user?.role
  if (r === 'super_admin') return 'Super Admin'
  if (r === 'admin') return 'Admin'
  return 'Padukuhan'
})

const tabs = computed(() => {
  const base = [
    { to: '/ops', label: 'Ringkasan' },
    { to: '/ops/cari', label: 'Cari' },
    { to: '/ops/kk', label: 'Kartu Keluarga' },
    { to: '/ops/warga', label: 'Data Warga' },
    { to: '/ops/mutasi', label: 'Mutasi' },
    { to: '/ops/surat', label: 'Surat' },
    { to: '/ops/portal', label: 'Portal' },
    { to: '/ops/peta', label: 'Peta' },
    { to: '/ops/import', label: 'Import' },
    { to: '/ops/laporan', label: 'Laporan' },
  ]
  if (auth.isAdmin) {
    base.push({ to: '/ops/backup', label: 'Backup' })
    base.push({ to: '/ops/master', label: 'Master' })
    base.push({ to: '/ops/log', label: 'Audit Log' })
  }
  if (auth.isSuper) base.push({ to: '/ops/akun', label: 'Pengguna' })
  return base
})

function goSearch() {
  navigateTo('/ops/cari')
}

async function onLogout() {
  await auth.logout()
  await navigateTo('/ops')
}

onMounted(() => {
  if (!auth.loaded) auth.fetchSession()
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && auth.user) {
      e.preventDefault()
      goSearch()
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

watch(
  () => route.fullPath,
  () => {
    if (!auth.loaded) auth.fetchSession()
  },
)
</script>
