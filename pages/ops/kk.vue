<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Kartu Keluarga</h1>
          <p class="text-sm muted">CRUD + detail anggota KK</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <label class="btn btn-ghost text-sm cursor-pointer">
            Import CSV
            <input type="file" accept=".csv,text/csv" class="hidden" @change="onImport" />
          </label>
          <button class="btn btn-primary text-sm" type="button" @click="openForm()">+ KK baru</button>
        </div>
      </div>

      <p v-if="importMsg" class="mt-3 text-sm" :style="{ color: importOk ? 'var(--ok)' : 'var(--danger)' }">
        {{ importMsg }}
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <input v-model="q" class="input max-w-xs" placeholder="Cari kepala / no. KK / alamat" @keyup.enter="load" />
        <select v-model="rt" class="input max-w-[8rem]" @change="load">
          <option value="">Semua RT</option>
          <option v-for="r in rtList" :key="r" :value="r">RT {{ r }}</option>
        </select>
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
                <td>
                  <button class="text-left font-medium hover:underline" type="button" style="color: var(--accent)" @click="openDetail(k)">
                    {{ k.kepalaKeluarga }}
                  </button>
                </td>
                <td>{{ k.rt }}/{{ k.rw }}</td>
                <td class="max-w-[12rem] truncate">{{ k.alamat }}</td>
                <td class="space-x-2 whitespace-nowrap">
                  <button class="text-xs" style="color: var(--accent)" type="button" @click="openDetail(k)">Detail</button>
                  <button class="text-xs muted" type="button" @click="openForm(k)">Ubah</button>
                  <button class="text-xs" style="color: var(--danger)" type="button" @click="remove(k)">Hapus</button>
                </td>
              </tr>
              <tr v-if="!items.length"><td colspan="5" class="muted">Tidak ada data</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="detail" class="modal-backdrop" @click.self="detail = null">
        <div class="card w-full max-w-2xl p-5 max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-xs muted font-mono">{{ detail.kk.nomorKk }}</div>
              <h2 class="font-display text-xl font-bold mt-1">{{ detail.kk.kepalaKeluarga }}</h2>
              <p class="text-sm muted mt-1">RT {{ detail.kk.rt }}/RW {{ detail.kk.rw }} · {{ detail.kk.alamat }}</p>
            </div>
            <button class="btn btn-ghost text-sm" type="button" @click="detail = null">Tutup</button>
          </div>
          <div class="mt-5">
            <div class="text-sm font-semibold mb-2">
              Anggota ({{ detail.warga.length }})
              <span v-if="detail.stats" class="muted font-normal">
                · L {{ detail.stats.laki }} / P {{ detail.stats.perempuan }} · aktif {{ detail.stats.aktif }}
              </span>
            </div>
            <div class="table-wrap card overflow-hidden">
              <table class="data">
                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>JK</th>
                    <th>Hubungan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="w in detail.warga" :key="w.id">
                    <td class="font-mono text-xs">{{ w.nik }}</td>
                    <td>{{ w.nama }}</td>
                    <td>{{ w.jk }}</td>
                    <td>{{ w.hubunganKk }}</td>
                    <td><span class="badge">{{ w.status }}</span></td>
                  </tr>
                  <tr v-if="!detail.warga.length"><td colspan="5" class="muted">Belum ada anggota</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="detail.mutasi?.length" class="mt-5">
            <div class="text-sm font-semibold mb-2">Mutasi terkait</div>
            <ul class="text-sm space-y-1">
              <li v-for="m in detail.mutasi" :key="m.id" class="muted">
                {{ m.tanggal }} · <span class="badge">{{ m.jenis }}</span> · {{ m.nama || m.nik }}
              </li>
            </ul>
          </div>
          <div v-if="detail.surat?.length" class="mt-5">
            <div class="text-sm font-semibold mb-2">Surat terkait</div>
            <ul class="text-sm space-y-1">
              <li v-for="s in detail.surat" :key="s.id">
                <span class="font-mono text-xs">{{ s.nomor }}</span> · {{ s.jenis }} · {{ s.nama }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Modal form -->
      <div v-if="show" class="modal-backdrop" @click.self="show = false">
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
            <input v-model="form.statusRumah" class="input" placeholder="Milik sendiri / Kontrak / …" />
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
const site = useSite()
const route = useRoute()
const items = ref<any[]>([])
const q = ref('')
const rt = ref('')
const show = ref(false)
const err = ref('')
const importMsg = ref('')
const importOk = ref(true)
const detail = ref<{
  kk: any
  warga: any[]
  mutasi?: any[]
  surat?: any[]
  stats?: any
} | null>(null)
const rtList = site.rtList
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
    query: { q: q.value || undefined, rt: rt.value || undefined },
  })
  items.value = res.items || []
}

async function openDetail(k: any) {
  try {
    const res = await $fetch<{ ok: boolean; data: any }>('/api/kk360', {
      query: { nomorKk: k.nomorKk },
    })
    const d = res.data
    detail.value = {
      kk: d.kk,
      warga: d.anggota || [],
      mutasi: d.mutasi || [],
      surat: d.surat || [],
      stats: d.ringkas || d.stats || null,
    }
  } catch {
    const res = await $fetch<{ ok: boolean; kk: any; warga: any[] }>('/api/keluarga', {
      query: { id: k.id },
    })
    detail.value = { kk: res.kk, warga: res.warga || [], mutasi: [], surat: [], stats: null }
  }
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

async function onImport(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importMsg.value = 'Mengimpor…'
  importOk.value = true
  try {
    const csv = await file.text()
    const res = await $fetch<{ ok: boolean; created: number; updated: number; errors: string[] }>('/api/import', {
      method: 'POST',
      body: { type: 'kk', csv },
    })
    importOk.value = (res.errors || []).length === 0
    importMsg.value = `Import KK: +${res.created} baru, ${res.updated} diperbarui${res.errors?.length ? `, ${res.errors.length} error` : ''}`
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
  const kkQ = String(route.query.kk || '')
  if (kkQ) {
    const hit = items.value.find((k) => k.nomorKk === kkQ)
    if (hit) await openDetail(hit)
  }
})
</script>
