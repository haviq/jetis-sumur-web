<template>
  <div class="max-w-lg mx-auto">
    <h1 class="font-display text-2xl font-bold">Verifikasi surat</h1>
    <p class="text-sm muted mt-1">Scan QR pada surat cetak untuk cek keaslian.</p>

    <div class="card p-5 mt-6">
      <div v-if="loading" class="muted text-sm">Memeriksa…</div>
      <div v-else-if="error" class="text-sm" style="color: var(--danger)">{{ error }}</div>
      <div v-else-if="data" class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="badge" style="background: var(--accent-dim); color: var(--accent)">Valid</span>
          <span class="muted">{{ data.surat?.status }}</span>
        </div>
        <div><span class="muted">Nomor</span> · <strong class="font-mono">{{ data.surat?.nomor }}</strong></div>
        <div><span class="muted">Jenis</span> · {{ data.surat?.jenis }}</div>
        <div><span class="muted">Nama</span> · {{ data.surat?.nama }}</div>
        <div><span class="muted">NIK</span> · <span class="font-mono">{{ data.surat?.nikMasked }}</span></div>
        <div><span class="muted">Keperluan</span> · {{ data.surat?.keperluan }}</div>
        <div class="muted text-xs">Diterbitkan: {{ data.surat?.createdAt }}</div>
      </div>
      <div v-else class="muted text-sm">Masukkan token di URL: /verifikasi?t=…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Verifikasi surat' })
const route = useRoute()
const loading = ref(true)
const error = ref('')
const data = ref<any>(null)

onMounted(async () => {
  const t = String(route.query.t || route.query.token || '')
  if (!t) {
    loading.value = false
    return
  }
  try {
    data.value = await $fetch('/api/verify', { query: { token: t } })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Surat tidak ditemukan / dibatalkan'
  } finally {
    loading.value = false
  }
})
</script>
