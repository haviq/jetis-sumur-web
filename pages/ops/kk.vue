<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Kartu Keluarga</h1>
          <p class="text-sm muted">CRUD data KK</p>
        </div>
        <button class="btn btn-primary text-sm" type="button" @click="openForm()">+ KK baru</button>
      </div>

      <div class="mt-4 flex gap-2">
        <input v-model="q" class="input max-w-xs" placeholder="Cari kepala / no. KK / alamat" @keyup.enter="load" />
        <button class="btn btn-ghost" type="button" @click="load">Cari</button>
      </div>

      <div class="card mt-4 overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>No. KK</th>
                <th>Kepala</th>
                <th>RT/RW</th>
                <th>Alamat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in items" :key="k.id">
                <td class="font-mono text-xs">{{ k.nomorKk }}</td>
                <td>{{ k.kepalaKeluarga }}</td>
                <td>{{ k.rt }}/{{ k.rw }}</td>
                <td class="max-w-[12rem] truncate">{{ k.alamat }}</td>
                <td class="space-x-2 whitespace-nowrap">
                  <button class="text-xs" style="color: var(--accent)" type="button" @click="openForm(k)">Ubah</button>
                  <button class="text-xs" style="color: var(--danger)" type="button" @click="remove(k)">Hapus</button>
                </td>
              </tr>
              <tr v-if="!items.length"><td colspan="5" class="muted">Tidak ada data</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal form -->
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style="background: rgba(0,0,0,.55)">
        <form class="card w-full max-w-lg p-5 space-y-3" @submit.prevent="save">
          <h2 class="font-semibold">{{ form.id ? 'Ubah KK' : 'KK baru' }}</h2>
          <div>
            <label class="label">Nomor KK (16 digit)</label>
            <input v-model="form.nomorKk" class="input" required pattern="\d{16}" />
          </div>
          <div>
            <label class="label">Kepala keluarga</label>
            <input v-model="form.kepalaKeluarga" class="input" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">RT</label>
              <input v-model="form.rt" class="input" required />
            </div>
            <div>
              <label class="label">RW</label>
              <input v-model="form.rw" class="input" required />
            </div>
          </div>
          <div>
            <label class="label">Alamat</label>
            <input v-model="form.alamat" class="input" required />
          </div>
          <div>
            <label class="label">Status rumah</label>
            <input v-model="form.statusRumah" class="input" />
          </div>
          <p v-if="err" class="text-sm" style="color: var(--danger)">{{ err }}</p>
          <div class="flex justify-end gap-2 pt-2">
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
useHead({ title: 'Ops · KK' })
const auth = useAuthStore()
const items = ref<any[]>([])
const q = ref('')
const show = ref(false)
const err = ref('')
const form = reactive({
  id: '',
  nomorKk: '',
  kepalaKeluarga: '',
  rt: '01',
  rw: '01',
  alamat: '',
  statusRumah: '',
})

async function load() {
  if (!auth.user) return
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/keluarga', {
    query: { q: q.value || undefined },
  })
  items.value = res.items || []
}

function openForm(k?: any) {
  err.value = ''
  form.id = k?.id || ''
  form.nomorKk = k?.nomorKk || ''
  form.kepalaKeluarga = k?.kepalaKeluarga || ''
  form.rt = k?.rt || '01'
  form.rw = k?.rw || '01'
  form.alamat = k?.alamat || ''
  form.statusRumah = k?.statusRumah || ''
  show.value = true
}

async function save() {
  err.value = ''
  try {
    await $fetch('/api/keluarga', {
      method: 'POST',
      body: {
        id: form.id || undefined,
        nomorKk: form.nomorKk,
        kepalaKeluarga: form.kepalaKeluarga,
        rt: form.rt,
        rw: form.rw,
        alamat: form.alamat,
        statusRumah: form.statusRumah || undefined,
      },
    })
    show.value = false
    await load()
  } catch (e: any) {
    err.value = e?.data?.statusMessage || 'Gagal simpan'
  }
}

async function remove(k: any) {
  if (!confirm(`Hapus KK ${k.nomorKk}? Anggota juga terhapus.`)) return
  await $fetch('/api/keluarga', { method: 'POST', body: { action: 'delete', id: k.id } })
  await load()
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
