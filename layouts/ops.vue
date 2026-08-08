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

      <!-- Tab strip: scroll horizontal di semua viewport, separator antar group di desktop -->
      <nav v-if="auth.user" class="container-page ops-nav-wrap" aria-label="Menu ops">
        <div class="ops-nav-scroll">
          <!-- Group: Ringkasan + Cari -->
          <NuxtLink to="/ops" class="nav-link" :class="{ 'router-link-active': isActive('/ops') }">Ringkasan</NuxtLink>
          <NuxtLink to="/ops/cari" class="nav-link" :class="{ 'router-link-active': isActive('/ops/cari') }">Cari</NuxtLink>

          <!-- Separator: Data -->
          <span class="ops-nav-sep" aria-hidden="true"></span>

          <!-- Group: Data -->
          <NuxtLink to="/ops/kk" class="nav-link" :class="{ 'router-link-active': isActive('/ops/kk') }">KK</NuxtLink>
          <NuxtLink to="/ops/warga" class="nav-link" :class="{ 'router-link-active': isActive('/ops/warga') }">Warga</NuxtLink>
          <NuxtLink to="/ops/mutasi" class="nav-link" :class="{ 'router-link-active': isActive('/ops/mutasi') }">Mutasi</NuxtLink>
          <NuxtLink to="/ops/surat" class="nav-link" :class="{ 'router-link-active': isActive('/ops/surat') }">Surat</NuxtLink>

          <!-- Separator: Manajemen -->
          <span class="ops-nav-sep" aria-hidden="true"></span>

          <!-- Group: Manajemen -->
          <NuxtLink to="/ops/portal" class="nav-link" :class="{ 'router-link-active': isActive('/ops/portal') }">Portal</NuxtLink>
          <NuxtLink to="/ops/agenda" class="nav-link" :class="{ 'router-link-active': isActive('/ops/agenda') }">Agenda</NuxtLink>
          <NuxtLink to="/ops/peta" class="nav-link" :class="{ 'router-link-active': isActive('/ops/peta') }">Peta</NuxtLink>
          <NuxtLink to="/ops/laporan" class="nav-link" :class="{ 'router-link-active': isActive('/ops/laporan') }">Laporan</NuxtLink>
          <NuxtLink to="/ops/dashboard-rt" class="nav-link" :class="{ 'router-link-active': isActive('/ops/dashboard-rt') }">Dashboard RT</NuxtLink>
          <NuxtLink to="/ops/anomali" class="nav-link" :class="{ 'router-link-active': isActive('/ops/anomali') }">Kualitas Data</NuxtLink>

          <!-- Separator + Group: Admin (hanya admin+) -->
          <template v-if="auth.isAdmin">
            <span class="ops-nav-sep" aria-hidden="true"></span>
            <NuxtLink to="/ops/import" class="nav-link" :class="{ 'router-link-active': isActive('/ops/import') }">Import</NuxtLink>
            <NuxtLink to="/ops/backup" class="nav-link" :class="{ 'router-link-active': isActive('/ops/backup') }">Backup</NuxtLink>
            <NuxtLink to="/ops/master" class="nav-link" :class="{ 'router-link-active': isActive('/ops/master') }">Master</NuxtLink>
            <NuxtLink to="/ops/log" class="nav-link" :class="{ 'router-link-active': isActive('/ops/log') }">Audit</NuxtLink>
            <NuxtLink to="/ops/laporan-pejabat" class="nav-link" :class="{ 'router-link-active': isActive('/ops/laporan-pejabat') }">Rek. Pejabat</NuxtLink>
            <NuxtLink to="/ops/notifikasi" class="nav-link" :class="{ 'router-link-active': isActive('/ops/notifikasi') }">Notif</NuxtLink>
          </template>

          <!-- Separator + Group: Super (hanya super_admin) -->
          <template v-if="auth.isSuper">
            <span class="ops-nav-sep" aria-hidden="true"></span>
            <NuxtLink to="/ops/akun" class="nav-link" :class="{ 'router-link-active': isActive('/ops/akun') }">Pengguna</NuxtLink>
            <NuxtLink to="/ops/onboard" class="nav-link" :class="{ 'router-link-active': isActive('/ops/onboard') }">Onboard</NuxtLink>
          </template>
        </div>
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
