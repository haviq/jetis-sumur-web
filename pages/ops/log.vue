<template>
  <div>
    <div v-if="!auth.user || !auth.isAdmin" class="muted">Hanya admin</div>
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl font-bold">Audit log</h1>
          <p class="text-sm muted mt-1">Aktivitas sistem — pantau tindakan pengelola secara real-time.</p>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="mt-6 flex flex-wrap gap-2.5 items-center">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari user, IP, atau aksi..." 
          class="input py-1.5 px-3 text-sm max-w-xs"
        />
        <select v-model="filterActivity" class="input py-1.5 px-3 text-sm max-w-[180px]">
          <option value="">Semua Aktivitas</option>
          <option value="login">Login</option>
          <option value="warga">Data Warga</option>
          <option value="kk">Data KK (Keluarga)</option>
          <option value="mutasi">Mutasi</option>
          <option value="import">Import Data</option>
        </select>
      </div>

      <div class="card mt-6 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left muted border-b" style="border-color: var(--border)">
              <th class="p-3">Waktu</th>
              <th class="p-3">User</th>
              <th class="p-3">Aktivitas</th>
              <th class="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in filteredItems" :key="l.id" class="border-b" style="border-color: var(--border)">
              <td class="p-3 whitespace-nowrap text-xs muted">{{ formatWhen(l.waktu) }}</td>
              <td class="p-3 font-medium">{{ l.user }}</td>
              <td class="p-3">
                <div>{{ l.human || l.aktivitas }}</div>
                <div v-if="l.human && l.human !== l.aktivitas" class="text-[11px] muted font-mono mt-0.5">
                  {{ l.aktivitas }}
                </div>
              </td>
              <td class="p-3 muted text-xs">{{ l.ip || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Log' })
const auth = useAuthStore()
const items = ref<any[]>([])
const searchQuery = ref('')
const filterActivity = ref('')

const filteredItems = computed(() => {
  let list = items.value
  
  // Filter query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(l => 
      l.user.toLowerCase().includes(q) || 
      (l.ip && l.ip.includes(q)) || 
      l.aktivitas.toLowerCase().includes(q) ||
      (l.human && l.human.toLowerCase().includes(q))
    )
  }
  
  // Filter dropdown
  if (filterActivity.value) {
    const act = filterActivity.value
    list = list.filter(l => {
      if (act === 'login') return l.aktivitas.includes('login')
      if (act === 'warga') return l.aktivitas.includes('warga')
      if (act === 'kk') return l.aktivitas.includes('kk')
      if (act === 'mutasi') return l.aktivitas.includes('mutasi')
      if (act === 'import') return l.aktivitas.includes('import')
      return true
    })
  }
  
  return list
})

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  } catch {
    return iso
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  const res = await $fetch<any>('/api/logs')
  items.value = res.items || []
})
</script>
