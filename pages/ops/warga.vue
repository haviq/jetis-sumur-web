<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Data Warga</h1>
          <p class="text-sm muted">CRUD data jiwa</p>
        </div>
        <button class="btn btn-primary text-sm" type="button" @click="openForm()">+ Warga</button>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <input v-model="q" class="input max-w-xs" placeholder="Cari NIK / nama / KK" @keyup.enter="load" />
        <select v-model="status" class="input max-w-[10rem]" @change="load">
          <option value="">Semua status</option>
          <option value="aktif">Aktif</option>
          <option value="pindah">Pindah</option>
          <option value="meninggal">Meninggal</option>
        </select>
        <button class="btn btn-ghost" type="button" @click="load">Cari</button>
      </div>

      <div class="card mt-4 overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama</th>
                <th>JK</th>
                <th>Hubungan</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in items" :key="w.id">
                <td class="font-mono text-xs">{{ w.nik }}</td>
                <td>{{ w.nama }}</td>
                <td>{{ w.jk }}</td>
                <td>{{ w.hubunganKk }}</td>
                <td><span class="badge">{{ w.status }}</span></td>
                <td class="space-x-2 whitespace-nowrap">
                  <button class="text-xs" style="color: var(--accent)" type="button" @click="openForm(w)">Ubah</button>
                  <button class="text-xs" style="color: var(--danger)" type="button" @click="remove(w)">Hapus</button>
                </td>
              </tr>
              <tr v-if="!items.length"><td colspan="6" class="muted">Tidak ada data</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style="background: rgba(0,0,0,.55)">
        <form class="card w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-y-auto" @submit.prevent="save">
          <h2 class="font-semibold">{{ form.id ? 'Ubah warga' : 'Warga baru' }}</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="label">NIK</label>
              <input v-model="form.nik" class="input" required pattern="\d{16}" />
            </div>
            <div class="col-span-2">
              <label class="label">Nama</label>
              <input v-model="form.nama" class="input" required />
            </div>
            <div class="col-span-2">
              <label class="label">Nomor KK</label>
              <input v-model="form.nomorKk" class="input" required pattern="\d{16}" />
            </div>
            <div>
              <label class="label">JK</label>
              <select v-model="form.jk" class="input">
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
            </div>
            <div>
              <label class="label">Hubungan KK</label>
              <select v-model="form.hubunganKk" class="input">
                <option v-for="h in hubungan" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>
            <div>
              <label class="label">Tgl lahir</label>
              <input v-model="form.tanggalLahir" type="date" class="input" />
            </div>
            <div>
              <label class="label">Agama</label>
              <input v-model="form.agama" class="input" />
            </div>
            <div>
              <label class="label">Pendidikan</label>
              <input v-model="form.pendidikan" class="input" />
            </div>
            <div>
              <label class="label">Pekerjaan</label>
              <input v-model="form.pekerjaan" class="input" />
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input">
                <option value="aktif">aktif</option>
                <option value="pindah">pindah</option>
                <option value="meninggal">meninggal</option>
                <option value="nonaktif">nonaktif</option>
              </select>
            </div>
            <div>
              <label class="label">No. HP</label>
              <input v-model="form.noHp" class="input" />
            </div>
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
useHead({ title: 'Ops · Warga' })
const auth = useAuthStore()
const items = ref<any[]>([])
const q = ref('')
const status = ref('')
const show = ref(false)
const err = ref('')
const hubungan = [
  'Kepala Keluarga',
  'Istri',
  'Suami',
  'Anak',
  'Menantu',
  'Cucu',
  'Orang Tua',
  'Mertua',
  'Famili Lain',
  'Lainnya',
]
const form = reactive({
  id: '',
  nik: '',
  nama: '',
  nomorKk: '',
  jk: 'L',
  hubunganKk: 'Lainnya',
  tanggalLahir: '',
  agama: '',
  pendidikan: '',
  pekerjaan: '',
  status: 'aktif',
  noHp: '',
})

async function load() {
  if (!auth.user) return
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/warga', {
    query: { q: q.value || undefined, status: status.value || undefined },
  })
  items.value = res.items || []
}

function openForm(w?: any) {
  err.value = ''
  Object.assign(form, {
    id: w?.id || '',
    nik: w?.nik || '',
    nama: w?.nama || '',
    nomorKk: w?.nomorKk || '',
    jk: w?.jk || 'L',
    hubunganKk: w?.hubunganKk || 'Lainnya',
    tanggalLahir: w?.tanggalLahir || '',
    agama: w?.agama || '',
    pendidikan: w?.pendidikan || '',
    pekerjaan: w?.pekerjaan || '',
    status: w?.status || 'aktif',
    noHp: w?.noHp || '',
  })
  show.value = true
}

async function save() {
  err.value = ''
  try {
    await $fetch('/api/warga', {
      method: 'POST',
      body: { ...form, id: form.id || undefined },
    })
    show.value = false
    await load()
  } catch (e: any) {
    err.value = e?.data?.statusMessage || 'Gagal simpan'
  }
}

async function remove(w: any) {
  if (!confirm(`Hapus ${w.nama}?`)) return
  await $fetch('/api/warga', { method: 'POST', body: { action: 'delete', id: w.id } })
  await load()
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
