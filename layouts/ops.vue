<template>
  <div class="min-h-screen" style="background: var(--bg)">
    <div
      class="border-b sticky top-0 z-30"
      style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(10px)"
    >
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <NuxtLink to="/ops" class="font-display font-bold truncate text-sm sm:text-base">
            Dashboard
          </NuxtLink>
          <span v-if="auth.user" class="badge-role" :class="roleBadgeClass">{{ roleLabel }}</span>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            v-if="auth.user"
            class="btn btn-ghost text-xs px-2 sm:px-3"
            type="button"
            title="Ctrl+K"
            @click="goSearch"
          >
            ⌕ <span class="hidden sm:inline">Cari</span>
          </button>
          <span v-if="auth.user" class="hidden lg:inline text-xs muted max-w-[9rem] truncate">
            {{ auth.user.nama }}
          </span>
          <button v-if="auth.user" class="btn btn-ghost text-xs px-2 sm:px-3" type="button" @click="onLogout">
            Keluar
          </button>
          <NuxtLink to="/" class="btn btn-ghost text-xs px-2 sm:px-3">Web</NuxtLink>
        </div>
      </div>

      <nav v-if="auth.user" class="container-page ops-nav-scroll" aria-label="Menu ops">
        <NuxtLink
          v-for="t in tabs"
          :key="t.to"
          :to="t.to"
          class="nav-link"
          :class="{ 'router-link-active': isActive(t.to) }"
        >
          {{ t.label }}
        </NuxtLink>
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
  if (r === 'padukuhan') return 'Padukuhan'
  return r || '—'
})

const roleBadgeClass = computed(() => {
  const r = auth.user?.role
  if (r === 'super_admin') return 'badge-role--super'
  if (r === 'admin') return 'badge-role--admin'
  return 'badge-role--padukuhan'
})

/**
 * Menu per role (UI mirror of server canAccess):
 * - padukuhan: data harian + surat/print (tanpa import/backup/master/audit/users)
 * - admin: + import, backup, master, audit
 * - super_admin: + pengguna
 */
const tabs = computed(() => {
  const base = [
    { to: '/ops', label: 'Ringkasan' },
    { to: '/ops/cari', label: 'Cari' },
    { to: '/ops/kk', label: 'KK' },
    { to: '/ops/warga', label: 'Warga' },
    { to: '/ops/mutasi', label: 'Mutasi' },
    { to: '/ops/surat', label: 'Surat' },
    { to: '/ops/portal', label: 'Portal' },
    { to: '/ops/agenda', label: 'Agenda' },
    { to: '/ops/peta', label: 'Peta' },
    { to: '/ops/dashboard-rt', label: 'Dashboard RT' },
    { to: '/ops/laporan', label: 'Laporan' },
  ]
  if (auth.isAdmin) {
    base.push(
      { to: '/ops/import', label: 'Import' },
      { to: '/ops/backup', label: 'Backup' },
      { to: '/ops/master', label: 'Master' },
      { to: '/ops/log', label: 'Audit' },
      { to: '/ops/notifikasi', label: 'Notif' },
    )
  }
  if (auth.isSuper) {
    base.push({ to: '/ops/akun', label: 'Pengguna' })
  }
  return base
})

function isActive(to: string) {
  if (to === '/ops') return route.path === '/ops' || route.path === '/ops/'
  return route.path === to || route.path.startsWith(to + '/')
}

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
