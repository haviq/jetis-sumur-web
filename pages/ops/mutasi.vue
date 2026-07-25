<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Mutasi</h1>
          <p class="text-sm muted">Masuk, keluar, lahir, meninggal, pindah</p>
        </div>
        <button class="btn btn-primary text-sm" type="button" @click="show = true">+ Mutasi</button>
      </div>

      <div class="card mt-4 overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>NIK</th>
                <th>Nama</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in items" :key="m.id">
                <td>{{ m.tanggal }}</td>
                <td><span class="badge">{{ m.jenis }}</span></td>
                <td class="font-mono text-xs">{{ m.nik }}</td>
                <td>{{ m.nama || '—' }}</td>
                <td class="muted text-sm">{{ m.keterangan || '—' }}</td>
              </tr>
              <tr v-if="!items.length"><td colspan="5" class="muted">Belum ada mutasi</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,.55)">
        <form class="card w-full max-w-md p-5 space-y-3" @submit.prevent="save">
          <h2 class="font-semibold">Catat mutasi</h2>
          <div>
            <label class="label">NIK</label>
            <input v-model="form.nik" class="input" required />
          </div>
          <div>
            <label class="label">Nama (opsional)</label>
            <input v-model="form.nama" class="input" />
          </div>
          <div>
            <label class="label">Jenis</label>
            <select v-model="form.jenis" class="input">
              <option v-for="j in jenisList" :key="j" :value="j">{{ j }}</option>
            </select>
          </div>
          <div>
            <label class="label">Tanggal</label>
            <input v-model="form.tanggal" type="date" class="input" required />
          </div>
          <div>
            <label class="label">Keterangan</label>
            <input v-model="form.keterangan" class="input" />
          </div>
          <p v-if="err" class="text-sm" style="color: var(--danger)">{{ err }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" @click="show = false">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Mutasi' })
const auth = useAuthStore()
const items = ref<any[]>([])
const show = ref(false)
const err = ref('')
const jenisList = ['masuk', 'keluar', 'lahir', 'meninggal', 'pindah_datang', 'pindah_keluar']
const form = reactive({
  nik: '',
  nama: '',
  jenis: 'masuk',
  tanggal: new Date().toISOString().slice(0, 10),
  keterangan: '',
})

async function load() {
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/mutasi')
  items.value = res.items || []
}

async function save() {
  err.value = ''
  try {
    await $fetch('/api/mutasi', { method: 'POST', body: { ...form } })
    // Optional WA deep-link for pengelola
    try {
      const wa = await $fetch<any>('/api/wa', {
        method: 'POST',
        body: {
          kind: 'mutasi',
          message: `[Jetis Sumur] Mutasi ${form.jenis}: ${form.nama || form.nik} · ${form.tanggal}${
            form.keterangan ? ` · ${form.keterangan}` : ''
          }`,
        },
      })
      if (wa?.ok && wa.url && confirm('Buka WhatsApp untuk notifikasi mutasi?')) {
        window.open(wa.url, '_blank', 'noopener')
      }
    } catch {
      /* optional */
    }
    show.value = false
    await load()
  } catch (e: any) {
    err.value = e?.data?.statusMessage || 'Gagal'
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
