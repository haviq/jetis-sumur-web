<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold">Kualitas & Audit Data</h1>
          <p class="text-sm muted mt-1">Deteksi otomatis anomali, NIK ganda, KK kosong, dan format tidak valid.</p>
        </div>
        <button @click="refreshData" :disabled="loading" class="btn text-sm py-1.5 px-3 flex items-center gap-2">
          <span>{{ loading ? 'Memindai...' : 'Pindai Ulang' }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card p-8 text-center mt-6">
        <span class="muted text-sm">Sedang memindai seluruh basis data warga...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-8 text-center mt-6 text-red-500">
        {{ error }}
      </div>

      <!-- No Anomalies -->
      <div v-else-if="anomalies.length === 0" class="card p-8 text-center mt-6 border-emerald-500/20 bg-emerald-500/5">
        <div class="text-emerald-500 font-semibold">🎉 Selamat! Tidak Ada Anomali Data</div>
        <p class="text-xs muted mt-1">Seluruh NIK, KK, dan demografi warga tercatat dalam format yang valid.</p>
      </div>

      <!-- Anomalies List -->
      <div v-else class="mt-6 space-y-6">
        <!-- Summary Cards -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div class="card p-4">
            <div class="text-xs muted">Total Masalah</div>
            <div class="text-2xl font-bold mt-1 text-red-500">{{ anomalies.length }}</div>
          </div>
          <div class="card p-4">
            <div class="text-xs muted">Tingkat Tinggi</div>
            <div class="text-2xl font-bold mt-1 text-red-500">
              {{ anomalies.filter(x => x.severity === 'high').length }}
            </div>
          </div>
          <div class="card p-4">
            <div class="text-xs muted">Tingkat Sedang</div>
            <div class="text-2xl font-bold mt-1 text-amber-500">
              {{ anomalies.filter(x => x.severity === 'medium').length }}
            </div>
          </div>
          <div class="card p-4">
            <div class="text-xs muted">NIK/KK Ganda</div>
            <div class="text-2xl font-bold mt-1 text-red-400">
              {{ anomalies.filter(x => x.type.includes('duplicate')).length }}
            </div>
          </div>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2 border-b border-border pb-1 overflow-x-auto text-sm">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-3 py-1.5 font-medium border-b-2 whitespace-nowrap"
            :class="activeTab === tab.value ? 'border-primary text-foreground' : 'border-transparent muted'"
          >
            {{ tab.label }} ({{ getCount(tab.value) }})
          </button>
        </div>

        <!-- Table list -->
        <div class="card overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left muted border-b border-border">
                <th class="p-3">Ref ID (NIK/KK)</th>
                <th class="p-3">Kategori</th>
                <th class="p-3">Tingkat</th>
                <th class="p-3">Deskripsi Masalah</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredItems" :key="idx" class="border-b border-border hover:bg-neutral-500/5">
                <td class="p-3 font-mono text-xs">{{ item.refId }}</td>
                <td class="p-3">
                  <span class="text-xs px-2 py-0.5 rounded bg-neutral-500/10 font-medium">
                    {{ formatType(item.type) }}
                  </span>
                </td>
                <td class="p-3">
                  <span 
                    class="text-[11px] uppercase font-bold px-1.5 py-0.5 rounded"
                    :class="item.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'"
                  >
                    {{ item.severity }}
                  </span>
                </td>
                <td class="p-3 font-medium">{{ item.message }}</td>
                <td class="p-3 text-right">
                  <NuxtLink 
                    :to="getEditLink(item)"
                    class="text-xs font-semibold hover:underline"
                    style="color: var(--accent)"
                  >
                    Perbaiki →
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Kualitas Data' })

const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const anomalies = ref<any[]>([])
const activeTab = ref('all')

const tabs = [
  { label: 'Semua Masalah', value: 'all' },
  { label: 'Tingkat Tinggi', value: 'high' },
  { label: 'Format NIK/KK', value: 'format' },
  { label: 'Duplikat', value: 'duplicate' },
  { label: 'Warga/KK Yatim', value: 'orphan' }
]

function getCount(tab: string) {
  if (tab === 'all') return anomalies.value.length
  if (tab === 'high') return anomalies.value.filter(x => x.severity === 'high').length
  if (tab === 'format') return anomalies.value.filter(x => x.type.includes('invalid')).length
  if (tab === 'duplicate') return anomalies.value.filter(x => x.type.includes('duplicate')).length
  if (tab === 'orphan') return anomalies.value.filter(x => x.type === 'warga_tanpa_kk' || x.type === 'kk_kosong').length
  return 0
}

const filteredItems = computed(() => {
  const items = anomalies.value
  if (activeTab.value === 'all') return items
  if (activeTab.value === 'high') return items.filter(x => x.severity === 'high')
  if (activeTab.value === 'format') return items.filter(x => x.type.includes('invalid'))
  if (activeTab.value === 'duplicate') return items.filter(x => x.type.includes('duplicate'))
  if (activeTab.value === 'orphan') return items.filter(x => x.type === 'warga_tanpa_kk' || x.type === 'kk_kosong')
  return items
})

function formatType(type: string) {
  if (type === 'nik_invalid') return 'Format NIK'
  if (type === 'nik_duplicate') return 'NIK Ganda'
  if (type === 'kk_invalid') return 'Format KK'
  if (type === 'kk_duplicate') return 'KK Ganda'
  if (type === 'warga_tanpa_kk') return 'KK Tidak Terdaftar'
  if (type === 'kk_kosong') return 'KK Kosong'
  if (type === 'umur_janggal') return 'Data Demografi'
  return type
}

function getEditLink(item: any) {
  if (item.type.startsWith('nik') || item.type === 'warga_tanpa_kk' || item.type === 'umur_janggal') {
    return `/ops/warga?q=${item.refId}`
  }
  return `/ops/kk?q=${item.refId}`
}

async function refreshData() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>('/api/stats/anomali')
    anomalies.value = res.items || []
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat analisis data.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await refreshData()
})
</script>
