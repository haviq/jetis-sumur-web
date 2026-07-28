<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Backup & restore</h1>
          <p class="text-sm muted mt-1">Export JSON penuh + restore merge/replace (admin).</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <a class="btn btn-primary text-sm" href="/api/backup" download>⬇ Download backup lokal</a>
          <button class="btn btn-ghost text-sm" type="button" :disabled="gBusy" @click="backupToGDrive">
            {{ gBusy ? 'Mengupload…' : '☁ Backup ke Google Drive' }}
          </button>
        </div>
      </div>

      <!-- Hasil backup GDrive -->
      <div v-if="gResult" class="card p-4 mt-4 max-w-xl space-y-1" style="border-color: var(--accent)">
        <p style="color: var(--accent)">✓ Backup berhasil diupload ke Google Drive</p>
        <p class="muted text-sm">File: <span class="font-mono text-xs">{{ gResult.fileName }}</span></p>
        <a :href="gResult.url" target="_blank" rel="noopener" class="underline text-xs" style="color: var(--accent)">Buka di Google Drive →</a>
      </div>
      <div v-if="gError" class="card p-4 mt-4 max-w-xl text-sm" style="color: var(--danger)">{{ gError }}</div>

      <div class="card p-5 mt-6 max-w-xl space-y-3">
        <h2 class="font-semibold">Restore dari file</h2>
        <p class="text-xs muted">Hanya admin/superadmin. Mode merge = gabung; replace = timpa store.</p>
        <input type="file" accept="application/json,.json" class="input" @change="onFile" />
        <div class="flex gap-2">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="mode" type="radio" value="merge" /> Merge
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="mode" type="radio" value="replace" /> Replace
          </label>
        </div>
        <button class="btn btn-ghost" type="button" :disabled="!bundle || busy" @click="restore">
          {{ busy ? 'Memulihkan…' : 'Pulihkan' }}
        </button>
        <p v-if="msg" class="text-sm" :style="{ color: ok ? 'var(--accent)' : 'var(--danger)' }">{{ msg }}</p>
      </div>

      <div class="card p-5 mt-4 max-w-xl text-sm muted">
        <strong class="text-[var(--text)]">Compliance:</strong>
        simpan backup di drive terenkripsi padukuhan. Jangan unggah ke chat publik.
        Data pribadi (NIK) tunduk pada kebijakan privasi internal.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Backup' })
const auth = useAuthStore()
const mode = ref<'merge' | 'replace'>('merge')
const bundle = ref<any>(null)
const busy = ref(false)
const msg = ref('')
const ok = ref(false)

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      bundle.value = JSON.parse(String(reader.result || '{}'))
      msg.value = `File OK · ${f.name}`
      ok.value = true
    } catch {
      bundle.value = null
      msg.value = 'JSON tidak valid'
      ok.value = false
    }
  }
  reader.readAsText(f)
}

const gBusy = ref(false)
const gResult = ref<{ fileName: string; url: string } | null>(null)
const gError = ref('')

async function backupToGDrive() {
  gBusy.value = true
  gResult.value = null
  gError.value = ''
  try {
    const res = await $fetch<{ ok: boolean; fileName: string; fileId: string; url: string }>(
      '/api/backup/gdrive',
      { method: 'POST' },
    )
    gResult.value = { fileName: res.fileName, url: res.url }
  } catch (e: any) {
    gError.value = e?.data?.statusMessage || e?.message || 'Gagal upload ke Google Drive'
  } finally {
    gBusy.value = false
  }
}

async function restore() {
  if (!bundle.value) return
  if (mode.value === 'replace' && !confirm('Replace akan menimpa data memori. Lanjut?')) return
  busy.value = true
  msg.value = ''
  try {
    const res = await $fetch<any>('/api/backup', {
      method: 'POST',
      body: { mode: mode.value, bundle: bundle.value },
    })
    ok.value = true
    msg.value = res.ok ? `Berhasil (${mode.value})` : 'Gagal'
  } catch (e: any) {
    ok.value = false
    msg.value = e?.data?.statusMessage || e?.message || 'Gagal restore'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  if (!auth.isAdmin) return navigateTo('/ops')
})
</script>
