<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Import wizard</h1>
      <p class="text-sm muted mt-1">Preview validasi CSV → commit. Template: NIK, nama, nomor_kk, …</p>

      <div class="card p-5 mt-6 max-w-2xl space-y-3">
        <div class="flex flex-wrap gap-3">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="type" type="radio" value="warga" /> Warga
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="type" type="radio" value="kk" /> Kartu Keluarga
          </label>
        </div>
        <textarea
          v-model="csv"
          class="input font-mono text-xs min-h-[160px]"
          placeholder="Paste CSV (baris 1 = header)…"
        />
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-ghost" type="button" :disabled="busy" @click="preview">Preview</button>
          <button class="btn btn-primary" type="button" :disabled="busy || !previewOk" @click="commit">
            Commit import
          </button>
        </div>
        <p v-if="msg" class="text-sm">{{ msg }}</p>
      </div>

      <div v-if="previewData" class="card p-5 mt-4 overflow-x-auto">
        <div class="text-sm mb-2">
          Total baris: <strong>{{ previewData.total }}</strong> · Error:
          <strong>{{ previewData.errorCount }}</strong>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="text-left muted border-b" style="border-color: var(--border)">
              <th class="py-1 pr-2">Line</th>
              <th class="py-1 pr-2">OK?</th>
              <th class="py-1">Pesan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in previewData.preview || []" :key="i" class="border-b" style="border-color: var(--border)">
              <td class="py-1 pr-2">{{ p.line }}</td>
              <td class="py-1 pr-2">{{ p.ok ? '✓' : '✗' }}</td>
              <td class="py-1">{{ p.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Import' })
const auth = useAuthStore()
const type = ref('warga')
const csv = ref('')
const busy = ref(false)
const msg = ref('')
const previewData = ref<any>(null)
const previewOk = computed(() => previewData.value && previewData.value.errorCount === 0 && previewData.value.total > 0)

async function preview() {
  busy.value = true
  msg.value = ''
  try {
    previewData.value = await $fetch('/api/import/wizard', {
      method: 'POST',
      body: { type: type.value, csv: csv.value, dryRun: true },
    })
    msg.value = `Preview: ${previewData.value.errorCount} error / ${previewData.value.total} baris`
  } catch (e: any) {
    msg.value = e?.data?.statusMessage || 'Gagal preview'
    previewData.value = null
  } finally {
    busy.value = false
  }
}

async function commit() {
  if (!previewOk.value) return
  if (!confirm('Import data sekarang?')) return
  busy.value = true
  try {
    const res = await $fetch<any>('/api/import/wizard', {
      method: 'POST',
      body: { type: type.value, csv: csv.value, dryRun: false },
    })
    msg.value = `Import OK · created ${res.created || 0} · updated ${res.updated || 0} · errors ${res.errors?.length || 0}`
  } catch (e: any) {
    msg.value = e?.data?.statusMessage || 'Gagal import'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
})
</script>
