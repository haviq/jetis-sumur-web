<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Surat keterangan</h1>
      <p class="text-sm muted mt-1">
        Generate surat siap cetak (Save as PDF di browser). Data diambil dari buku warga.
      </p>

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
          <button class="btn btn-primary" type="submit">Buka & cetak</button>
          <a class="btn btn-ghost" href="/api/print?type=rekap" target="_blank" rel="noopener">Rekap penduduk</a>
          <a class="btn btn-ghost" href="/api/print?type=warga" target="_blank" rel="noopener">Daftar warga PDF</a>
        </div>
      </form>

      <div class="card p-5 mt-4 max-w-xl text-sm muted">
        <strong class="text-[var(--text)]">Cara PDF:</strong>
        halaman surat terbuka → tombol <em>Cetak / Simpan PDF</em> → pilih printer “Save as PDF”.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Surat' })
const auth = useAuthStore()
const err = ref('')
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
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
})
</script>
