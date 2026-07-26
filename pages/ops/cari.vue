<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Pencarian global</h1>
          <p class="text-sm muted mt-1">
            Cari NIK / No.KK / nama di seluruh data (Ctrl+K).
            <span v-if="indexed">
              · indeks {{ indexed.warga }} warga · {{ indexed.kk }} KK · {{ indexed.mutasi }} mutasi
            </span>
          </p>
        </div>
        <button class="btn btn-ghost text-sm" type="button" :disabled="busy" @click="run">
          {{ busy ? 'Mencari…' : 'Cari' }}
        </button>
      </div>

      <div class="card p-4 mt-5">
        <input
          ref="qEl"
          v-model="q"
          class="input text-base"
          placeholder="Contoh: Sutrisno · 3404 · No. KK…"
          autocomplete="off"
          @input="onType"
          @keydown.enter.prevent="run"
        />
        <p v-if="hint" class="text-xs muted mt-2">{{ hint }}</p>
        <p v-if="error" class="text-sm mt-2" style="color: var(--danger)">{{ error }}</p>
      </div>

      <div v-if="busy" class="muted text-sm mt-4">Mencari…</div>
      <div v-else class="grid gap-4 mt-4 lg:grid-cols-3">
        <div class="card p-4">
          <h2 class="font-semibold mb-2">Warga ({{ result.warga?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li
              v-for="w in result.warga || []"
              :key="w.id"
              class="border-b pb-2"
              style="border-color: var(--border)"
            >
              <div class="font-medium">{{ w.nama }}</div>
              <div class="muted text-xs font-mono">{{ w.nik }} · KK {{ w.nomorKk }}</div>
              <NuxtLink class="text-xs underline" :to="`/ops/kk?kk=${w.nomorKk}`">Buka KK 360°</NuxtLink>
            </li>
            <li v-if="!(result.warga || []).length" class="muted">{{ emptyLabel }}</li>
          </ul>
        </div>
        <div class="card p-4">
          <h2 class="font-semibold mb-2">KK ({{ result.kk?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li
              v-for="k in result.kk || []"
              :key="k.id"
              class="border-b pb-2"
              style="border-color: var(--border)"
            >
              <div class="font-medium">{{ k.kepalaKeluarga }}</div>
              <div class="muted text-xs font-mono">{{ k.nomorKk }} · RT {{ k.rt }}</div>
              <NuxtLink class="text-xs underline" :to="`/ops/kk?kk=${k.nomorKk}`">Detail</NuxtLink>
            </li>
            <li v-if="!(result.kk || []).length" class="muted">{{ emptyLabel }}</li>
          </ul>
        </div>
        <div class="card p-4">
          <h2 class="font-semibold mb-2">Mutasi ({{ result.mutasi?.length || 0 }})</h2>
          <ul class="space-y-2 text-sm">
            <li
              v-for="m in result.mutasi || []"
              :key="m.id"
              class="border-b pb-2"
              style="border-color: var(--border)"
            >
              <div class="font-medium">{{ m.nama || m.nik }} · {{ m.jenis }}</div>
              <div class="muted text-xs">{{ m.tanggal || '—' }}</div>
            </li>
            <li v-if="!(result.mutasi || []).length" class="muted">{{ emptyLabel }}</li>
          </ul>
        </div>
      </div>

      <div v-if="quick.length" class="card p-4 mt-4">
        <h2 class="font-semibold text-sm mb-2">Coba cepat (data terindeks)</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in quick"
            :key="s"
            type="button"
            class="btn btn-ghost text-xs"
            @click="useQuick(s)"
          >
            {{ s }}
          </button>
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
const qEl = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const error = ref('')
const result = ref<{ warga: any[]; kk: any[]; mutasi: any[] }>({ warga: [], kk: [], mutasi: [] })
const indexed = ref<{ warga: number; kk: number; mutasi: number } | null>(null)
const minQuery = ref(false)
const quick = ref<string[]>([])

const emptyLabel = computed(() => {
  if (error.value) return 'Gagal memuat'
  if (!q.value.trim()) return 'Ketik kata kunci di atas'
  if (minQuery.value) return 'Minimal 2 karakter'
  return 'Tidak ada hasil'
})

const hint = computed(() => {
  if (!q.value.trim()) return 'Ketik minimal 2 huruf nama, atau 2+ digit NIK/KK.'
  if (minQuery.value) return 'Tambah karakter lagi untuk mencari.'
  if (indexed.value && indexed.value.warga === 0 && indexed.value.kk === 0) {
    return 'Indeks data kosong — cek tab Warga/KK atau isi data di Sheets.'
  }
  return ''
})

let t: ReturnType<typeof setTimeout> | undefined

function onType() {
  clearTimeout(t)
  t = setTimeout(run, 280)
}

function useQuick(s: string) {
  q.value = s
  run()
}

async function loadQuick() {
  try {
    const [w, k] = await Promise.all([
      $fetch<{ items: any[] }>('/api/warga', { query: { limit: 5 } as any }).catch(() => ({ items: [] })),
      $fetch<{ items: any[] }>('/api/keluarga').catch(() => ({ items: [] })),
    ])
    const names = (w.items || []).slice(0, 4).map((x) => x.nama).filter(Boolean)
    const heads = (k.items || []).slice(0, 3).map((x) => x.kepalaKeluarga).filter(Boolean)
    const niks = (w.items || []).slice(0, 2).map((x) => String(x.nik || '').slice(0, 6)).filter((x) => x.length >= 4)
    quick.value = Array.from(new Set([...names, ...heads, ...niks])).slice(0, 8)
    if (!indexed.value) {
      indexed.value = {
        warga: (w.items || []).length,
        kk: (k.items || []).length,
        mutasi: 0,
      }
    }
  } catch {
    /* ignore */
  }
}

async function run() {
  error.value = ''
  minQuery.value = false
  const query = q.value.trim()
  if (!query) {
    result.value = { warga: [], kk: [], mutasi: [] }
    return
  }
  busy.value = true
  try {
    const res = await $fetch<{
      ok?: boolean
      warga?: any[]
      kk?: any[]
      mutasi?: any[]
      totalIndexed?: { warga: number; kk: number; mutasi: number }
      minQuery?: boolean
    }>('/api/search', { query: { q: query, limit: 20 } })
    result.value = {
      warga: res.warga || [],
      kk: res.kk || [],
      mutasi: res.mutasi || [],
    }
    if (res.totalIndexed) indexed.value = res.totalIndexed
    minQuery.value = !!res.minQuery
  } catch (e: any) {
    const code = e?.data?.statusMessage || e?.statusMessage || e?.message || 'error'
    if (code === 'unauthorized' || e?.statusCode === 401) {
      error.value = 'Sesi habis — login ulang di /ops'
    } else {
      error.value = `Gagal cari: ${code}`
    }
    result.value = { warga: [], kk: [], mutasi: [] }
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await loadQuick()
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
