<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Pencarian global</h1>
          <p class="text-sm muted mt-1">Cari NIK / No.KK / nama di seluruh data (Ctrl+K).</p>
        </div>
      </div>

      <div class="card p-4 mt-5">
        <input
          ref="qEl"
          v-model="q"
          class="input text-base"
          placeholder="Ketik NIK, No. KK, atau nama…"
          @input="onType"
          @keydown.enter.prevent="run"
        />
      </div>

      <div v-if="busy" class="muted text-sm mt-4">Mencari…</div>
      <div v-else class="grid gap-4 mt-4 lg:grid-cols-3">
        <div class="card p-4">
          <h2 class="font-semibold mb-2">Warga ({{ result.warga?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="w in result.warga || []" :key="w.id" class="border-b pb-2" style="border-color: var(--border)">
              <div class="font-medium">{{ w.nama }}</div>
              <div class="muted text-xs font-mono">{{ w.nik }} · KK {{ w.nomorKk }}</div>
              <NuxtLink class="text-xs underline" :to="`/ops/kk?kk=${w.nomorKk}`">Buka KK 360°</NuxtLink>
            </li>
            <li v-if="!(result.warga || []).length" class="muted">—</li>
          </ul>
        </div>
        <div class="card p-4">
          <h2 class="font-semibold mb-2">KK ({{ result.kk?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="k in result.kk || []" :key="k.id" class="border-b pb-2" style="border-color: var(--border)">
              <div class="font-medium">{{ k.kepalaKeluarga }}</div>
              <div class="muted text-xs font-mono">{{ k.nomorKk }} · RT {{ k.rt }}</div>
              <NuxtLink class="text-xs underline" :to="`/ops/kk?kk=${k.nomorKk}`">Detail</NuxtLink>
            </li>
            <li v-if="!(result.kk || []).length" class="muted">—</li>
          </ul>
        </div>
        <div class="card p-4">
          <h2 class="font-semibold mb-2">Mutasi ({{ result.mutasi?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="m in result.mutasi || []" :key="m.id" class="border-b pb-2" style="border-color: var(--border)">
              <div class="font-medium">{{ m.nama || m.nik }} · {{ m.jenis }}</div>
              <div class="muted text-xs">{{ m.tanggal }}</div>
            </li>
            <li v-if="!(result.mutasi || []).length" class="muted">—</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Cari' })
const auth = useAuthStore()
const route = useRoute()
const q = ref(String(route.query.q || ''))
const busy = ref(false)
const result = ref<any>({ warga: [], kk: [], mutasi: [] })
const qEl = ref<HTMLInputElement | null>(null)
let t: any

function onType() {
  clearTimeout(t)
  t = setTimeout(run, 280)
}

async function run() {
  if (!q.value.trim()) {
    result.value = { warga: [], kk: [], mutasi: [] }
    return
  }
  busy.value = true
  try {
    result.value = await $fetch('/api/search', { query: { q: q.value, limit: 20 } })
  } catch {
    result.value = { warga: [], kk: [], mutasi: [] }
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  qEl.value?.focus()
  if (q.value) run()
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      qEl.value?.focus()
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>
