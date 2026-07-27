<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Data Warga</h1>
          <p class="text-sm muted">CRUD data jiwa + import CSV</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <label class="btn btn-ghost text-sm cursor-pointer">
            Import CSV
            <input type="file" accept=".csv,text/csv" class="hidden" @change="onImport" />
          </label>
          <button class="btn btn-primary text-sm" type="button" @click="openForm()">+ Warga</button>
        </div>
      </div>

      <p v-if="importMsg" class="mt-3 text-sm" :style="{ color: importOk ? 'var(--ok)' : 'var(--danger)' }">
        {{ importMsg }}
      </p>

      <div class="mt-4 flex flex-wrap gap-2 items-center">
        <input v-model="q" class="input max-w-xs" placeholder="Cari NIK / nama / KK" @keyup.enter="load" />
        <select v-model="status" class="input max-w-[10rem]" @change="load">
          <option value="">Semua status</option>
          <option value="aktif">Aktif</option>
          <option value="pindah">Pindah</option>
          <option value="meninggal">Meninggal</option>
        </select>
        <select v-model="filterRt" class="input max-w-[10rem]" @change="load">
          <option value="">Semua RT</option>
          <option v-for="rt in rtList" :key="rt" :value="rt">RT {{ rt }}</option>
        </select>
        <button class="btn btn-ghost" type="button" @click="load">Cari</button>
        <button
          v-if="selected.length"
          class="btn btn-ghost text-sm"
          type="button"
          @click="bulkStatus('pindah')"
        >
          Bulk → pindah ({{ selected.length }})
        </button>
        <button
          v-if="selected.length"
          class="btn btn-ghost text-sm"
          type="button"
          @click="bulkStatus('aktif')"
        >
          Bulk → aktif
        </button>
      </div>

      <!-- Desktop table -->
      <div class="card mt-4 overflow-hidden hidden md:block">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th class="w-8">
                  <input type="checkbox" :checked="allSelected" @change="toggleAll" />
                </th>
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
                <td>
                  <input v-model="selected" type="checkbox" :value="w.id" />
                </td>
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
              <tr v-if="!items.length"><td colspan="7" class="muted">Tidak ada data</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile card list -->
      <div class="md:hidden mt-4 space-y-3">
        <div v-for="w in items" :key="w.id" class="card p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <input v-model="selected" type="checkbox" :value="w.id" />
                <h3 class="font-semibold text-base">{{ w.nama }}</h3>
              </div>
              <p class="font-mono text-xs muted mb-2">{{ w.nik }}</p>
              <div class="flex flex-wrap gap-2 mb-2">
                <span class="badge text-xs">RT {{ getWargaRt(w) }}</span>
                <span class="badge text-xs">{{ w.status }}</span>
                <span class="text-xs muted">{{ w.jk }}</span>
                <span class="text-xs muted">{{ w.hubunganKk }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-2 pt-2" style="border-top: 1px solid var(--border)">
            <button class="text-sm flex-1" style="color: var(--accent)" type="button" @click="openForm(w)">
              ✏️ Ubah
            </button>
            <button class="text-sm flex-1" style="color: var(--danger)" type="button" @click="remove(w)">
              🗑️ Hapus
            </button>
          </div>
        </div>
        <div v-if="!items.length" class="card p-4 muted text-center">Tidak ada data</div>
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
const selected = ref<string[]>([])
const q = ref('')
const status = ref('')
const filterRt = ref('')
const show = ref(false)
const err = ref('')
const importMsg = ref('')
const importOk = ref(true)
const kkMap = ref<Map<string, any>>(new Map())
const rtList = ref<string[]>([])
const allSelected = computed(
  () => items.value.length > 0 && selected.value.length === items.value.length,
)

function toggleAll(e: Event) {
  const on = (e.target as HTMLInputElement).checked
  selected.value = on ? items.value.map((w) => w.id) : []
}

async function bulkStatus(st: string) {
  if (!selected.value.length) return
  if (!confirm(`Ubah ${selected.value.length} warga → ${st}?`)) return
  await $fetch('/api/bulk', {
    method: 'POST',
    body: { target: 'warga', ids: selected.value, status: st },
  })
  selected.value = []
  await load()
}
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
  jk: 'L' as 'L' | 'P',
  hubunganKk: 'Kepala Keluarga',
  tanggalLahir: '',
  agama: '',
  pendidikan: '',
  pekerjaan: '',
  status: 'aktif',
  noHp: '',
})

function getWargaRt(w: any): string {
  const kk = kkMap.value.get(w.nomorKk)
  return kk?.rt || '—'
}

async function load() {
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (status.value) params.set('status', status.value)
    if (filterRt.value) params.set('rt', filterRt.value)
    const url = `/api/warga?${params.toString()}`
    const res = await $fetch<{ ok: boolean; items: any[] }>(url)
    items.value = res.items || []

    // Load KK data for RT mapping
    const kkRes = await $fetch<{ ok: boolean; items: any[] }>('/api/keluarga')
    kkMap.value = new Map((kkRes.items || []).map((k) => [k.nomorKk, k]))
    const rts = Array.from(new Set((kkRes.items || []).map((k) => k.rt))).sort()
    rtList.value = rts
  } catch (e) {
    console.error('Failed to load:', e)
  }
}

function openForm(w?: any) {
  if (w) {
    Object.assign(form, {
      id: w.id,
      nik: w.nik,
      nama: w.nama,
      nomorKk: w.nomorKk,
      jk: w.jk,
      hubunganKk: w.hubunganKk,
      tanggalLahir: w.tanggalLahir || '',
      agama: w.agama || '',
      pendidikan: w.pendidikan || '',
      pekerjaan: w.pekerjaan || '',
      status: w.status,
      noHp: w.noHp || '',
    })
  } else {
    form.id = ''
    form.nik = ''
    form.nama = ''
    form.nomorKk = ''
    form.jk = 'L'
    form.hubunganKk = 'Kepala Keluarga'
    form.tanggalLahir = ''
    form.agama = ''
    form.pendidikan = ''
    form.pekerjaan = ''
    form.status = 'aktif'
    form.noHp = ''
  }
  err.value = ''
  show.value = true
}

async function save() {
  err.value = ''
  try {
    const body = { ...form }
    await $fetch('/api/warga', { method: 'POST', body })
    show.value = false
    await load()
  } catch (e: any) {
    err.value = e?.data?.statusMessage || 'Gagal simpan'
  }
}

async function remove(w: any) {
  if (!confirm(`Hapus ${w.nama}?`)) return
  try {
    await $fetch(`/api/warga`, {
      method: 'POST',
      body: { id: w.id, _action: 'delete' },
    })
    await load()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal hapus')
  }
}

async function onImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importMsg.value = 'Mengimpor…'
  importOk.value = true
  try {
    const csv = await file.text()
    const res = await $fetch<{ ok: boolean; created: number; updated: number; errors: string[] }>(
      '/api/import',
      { method: 'POST', body: { type: 'warga', csv } },
    )
    importOk.value = (res.errors || []).length === 0
    importMsg.value = `Import warga: +${res.created} baru, ${res.updated} diperbarui${
      res.errors?.length ? `, ${res.errors.length} error` : ''
    }`
    await load()
  } catch (e: any) {
    importOk.value = false
    importMsg.value = e?.data?.statusMessage || 'Import gagal'
  } finally {
    input.value = ''
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
