<template>
  <div class="min-h-screen" style="background: var(--bg)">
    <div class="border-b sticky top-0 z-30" style="border-color: var(--border); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(10px)">
      <div class="container-page flex h-14 items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/ops" class="font-display font-bold truncate">Dashboard Pengelola</NuxtLink>
          <span v-if="auth.user" class="badge hidden sm:inline-flex">{{ roleLabel }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="auth.user" class="hidden sm:inline text-xs muted">{{ auth.user.nama }}</span>
          <button v-if="auth.user" class="btn btn-ghost text-xs" type="button" @click="onLogout">Keluar</button>
          <NuxtLink to="/" class="btn btn-ghost text-xs">Web publik</NuxtLink>
        </div>
      </div>
      <nav v-if="auth.user" class="container-page flex gap-1 overflow-x-auto pb-2.5">
        <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-link whitespace-nowrap">{{ t.label }}</NuxtLink>
      </nav>
    </div>
    <div class="container-page py-6">
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
    { to: '/ops/kk', label: 'Kartu Keluarga' },
    { to: '/ops/warga', label: 'Data Warga' },
    { to: '/ops/mutasi', label: 'Mutasi' },
    { to: '/ops/laporan', label: 'Laporan' },
  ]
  if (auth.isAdmin) base.push({ to: '/ops/master', label: 'Master' })
  if (auth.isSuper) base.push({ to: '/ops/akun', label: 'Pengguna' })
  if (auth.isAdmin) base.push({ to: '/ops/log', label: 'Audit Log' })
  return base
})

async function onLogout() {
  await auth.logout()
  await navigateTo('/ops')
}

onMounted(() => {
  if (!auth.loaded) auth.fetchSession()
})

watch(
  () => route.fullPath,
  () => {
    if (!auth.loaded) auth.fetchSession()
  },
)
</script>
