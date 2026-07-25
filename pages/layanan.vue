<template>
  <div class="max-w-lg mx-auto">
    <h1 class="font-display text-2xl font-bold">Portal warga</h1>
    <p class="text-sm muted mt-1">
      Ajukan surat atau update data. Pengelola akan menindaklanjuti di dashboard.
    </p>

    <form class="card p-5 mt-6 space-y-3" @submit.prevent="submit">
      <div>
        <label class="label">Jenis</label>
        <select v-model="form.jenis" class="input">
          <option value="surat">Pengajuan surat</option>
          <option value="update_data">Update data pribadi</option>
        </select>
      </div>
      <div>
        <label class="label">Nama lengkap</label>
        <input v-model="form.nama" class="input" required minlength="3" />
      </div>
      <div>
        <label class="label">NIK (16 digit)</label>
        <input v-model="form.nik" class="input font-mono" required pattern="\d{16}" />
      </div>
      <div>
        <label class="label">No. HP / WA (opsional)</label>
        <input v-model="form.noHp" class="input" placeholder="08…" />
      </div>
      <div>
        <label class="label">Keperluan</label>
        <input v-model="form.keperluan" class="input" required minlength="3" />
      </div>
      <div>
        <label class="label">Detail tambahan</label>
        <textarea v-model="form.detail" class="input min-h-[80px]" />
      </div>
      <p v-if="msg" class="text-sm" :style="{ color: ok ? 'var(--accent)' : 'var(--danger)' }">{{ msg }}</p>
      <button class="btn btn-primary w-full" type="submit" :disabled="busy">
        {{ busy ? 'Mengirim…' : 'Kirim pengajuan' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Portal warga' })
const form = reactive({
  jenis: 'surat',
  nama: '',
  nik: '',
  noHp: '',
  keperluan: '',
  detail: '',
})
const busy = ref(false)
const msg = ref('')
const ok = ref(false)

async function submit() {
  busy.value = true
  msg.value = ''
  try {
    const res = await $fetch<any>('/api/portal', { method: 'POST', body: { ...form } })
    ok.value = true
    msg.value = `Terkirim · ID ${res.item?.id || ''} · status ${res.item?.status || 'menunggu'}`
    form.keperluan = ''
    form.detail = ''
  } catch (e: any) {
    ok.value = false
    msg.value = e?.data?.statusMessage || 'Gagal kirim'
  } finally {
    busy.value = false
  }
}
</script>
