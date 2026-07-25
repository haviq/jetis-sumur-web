<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Surat & arsip</h1>
          <p class="text-sm muted mt-1">
            Template surat + arsip otomatis + QR verifikasi publik.
          </p>
        </div>
        <a class="btn btn-ghost text-sm" href="/api/print?type=pejabat" target="_blank" rel="noopener">
          Laporan pejabat
        </a>
      </div>

      <form class="card p-5 mt-6 space-y-3 max-w-xl" @submit.prevent="openSurat">
        <div>
          <label class="label">Jenis surat</label>
          <select v-model="form.jenis" class="input">
            <option value="domisili">Keterangan Domisili</option>
            <option value="pengantar">Surat Pengantar</option>
            <option value="usaha">Keterangan Usaha</option>
            <option value="tidak_mampu">Keterangan Tidak Mampu</option>
            <option value="umum">Keterangan Umum</option>
          </select>
        </div>
        <div>
          <label class="label">NIK warga (16 digit)</label>
          <input v-model="form.nik" class="input font-mono" required pattern="\d{16}" placeholder="3404…" />
        </div>
        <div>
          <label class="label">Keperluan</label>
          <input v-model="form.keperluan" class="input" placeholder="mis. melamar kerja / sekolah / bank" />
        </div>
        <div>
          <label class="label">Nomor surat (opsional)</label>
          <input v-model="form.nomor" class="input" placeholder="otomatis jika kosong" />
        </div>
        <p v-if="err" class="text-sm" style="color: var(--danger)">{{ err }}</p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button class="btn btn-primary" type="submit">Buka & cetak (+ arsip QR)</button>
          <a class="btn btn-ghost" href="/api/print?type=rekap" target="_blank" rel="noopener">Rekap</a>
          <a class="btn btn-ghost" href="/api/print?type=warga" target="_blank" rel="noopener">Daftar warga</a>
        </div>
      </form>

      <div class="card p-5 mt-6">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 class="font-semibold">Arsip surat</h2>
          <button class="btn btn-ghost text-xs" type="button" :disabled="loading" @click="loadArsip">
            {{ loading ? '…' : 'Muat ulang' }}
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left muted border-b" style="border-color: var(--border)">
                <th class="py-2 pr-2">Nomor</th>
                <th class="py-2 pr-2">Jenis</th>
                <th class="py-2 pr-2">Nama</th>
                <th class="py-2 pr-2">Status</th>
                <th class="py-2">Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in arsip" :key="s.id" class="border-b" style="border-color: var(--border)">
                <td class="py-2 pr-2 font-mono text-xs">{{ s.nomor }}</td>
                <td class="py-2 pr-2">{{ s.jenis }}</td>
                <td class="py-2 pr-2">{{ s.nama }}</td>
                <td class="py-2 pr-2"><span class="badge">{{ s.status }}</span></td>
                <td class="py-2">
                  <a class="text-xs underline" :href="`/verifikasi?t=${s.verifyToken}`" target="_blank" rel="noopener">
                    buka
                  </a>
                </td>
              </tr>
              <tr v-if="!arsip.length">
                <td colspan="5" class="py-4 muted text-center">Belum ada arsip</td>
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
useHead({ title: 'Ops · Surat' })
const auth = useAuthStore()
const err = ref('')
const loading = ref(false)
const arsip = ref<any[]>([])
const form = reactive({
  jenis: 'domisili',
  nik: '',
  keperluan: 'administrasi',
  nomor: '',
})

function openSurat() {
  err.value = ''
  if (!/^\d{16}$/.test(form.nik)) {
    err.value = 'NIK harus 16 digit'
    return
  }
  const q = new URLSearchParams({
    type: 'surat',
    jenis: form.jenis,
    nik: form.nik,
    keperluan: form.keperluan || 'administrasi',
  })
  if (form.nomor.trim()) q.set('nomor', form.nomor.trim())
  window.open(`/api/print?${q.toString()}`, '_blank', 'noopener')
  setTimeout(loadArsip, 800)
}

async function loadArsip() {
  loading.value = true
  try {
    const res = await $fetch<any>('/api/surat')
    arsip.value = res.items || []
  } catch {
    arsip.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await loadArsip()
})
</script>
