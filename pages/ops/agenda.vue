<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Agenda & Pengumuman</h1>
          <p class="text-sm muted mt-1">Jadwal kegiatan dan pengumuman padukuhan.</p>
        </div>
        <button
          v-if="canWrite"
          class="btn btn-primary text-sm"
          type="button"
          @click="openForm()"
        >
          + Tambah Agenda
        </button>
      </div>

      <!-- Filter status -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button
          v-for="s in filterOptions"
          :key="s.value"
          class="btn text-xs"
          :class="filter === s.value ? 'btn-primary' : 'btn-ghost'"
          type="button"
          @click="setFilter(s.value)"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Tabel agenda -->
      <div class="card mt-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left muted border-b" style="border-color: var(--border)">
              <th class="p-3">Tanggal</th>
              <th class="p-3">Judul / Lokasi</th>
              <th class="p-3 hidden sm:table-cell">Dibuat</th>
              <th class="p-3">Status</th>
              <th v-if="canWrite" class="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="it in items"
              :key="it.id"
              class="border-b"
              style="border-color: var(--border)"
            >
              <!-- Tanggal + waktu -->
              <td class="p-3 whitespace-nowrap">
                <div class="font-medium">{{ formatTanggal(it.tanggal) }}</div>
                <div v-if="it.waktu" class="text-xs muted">{{ it.waktu }} WIB</div>
              </td>

              <!-- Judul + lokasi -->
              <td class="p-3">
                <div class="font-medium">{{ it.judul }}</div>
                <div v-if="it.lokasi" class="text-xs muted">📍 {{ it.lokasi }}</div>
                <div v-if="it.deskripsi" class="text-xs muted mt-0.5 max-w-xs truncate">
                  {{ it.deskripsi }}
                </div>
              </td>

              <!-- Dibuat oleh -->
              <td class="p-3 text-xs muted hidden sm:table-cell whitespace-nowrap">
                <div>{{ it.createdBy || '—' }}</div>
                <div>{{ formatCreatedAt(it.createdAt) }}</div>
              </td>

              <!-- Status badge -->
              <td class="p-3">
                <span
                  class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  :class="statusClass(it.status)"
                >
                  {{ it.status }}
                </span>
              </td>

              <!-- Aksi -->
              <td v-if="canWrite" class="p-3 space-x-1 whitespace-nowrap">
                <button
                  v-if="it.status === 'aktif'"
                  class="btn btn-ghost text-xs"
                  type="button"
                  :disabled="busy === it.id"
                  @click="setStatus(it, 'selesai')"
                >
                  Selesai
                </button>
                <button
                  v-if="it.status === 'aktif'"
                  class="btn btn-ghost text-xs"
                  type="button"
                  :disabled="busy === it.id"
                  @click="setStatus(it, 'batal')"
                >
                  Batal
                </button>
                <button
                  v-if="it.status !== 'aktif'"
                  class="btn btn-ghost text-xs"
                  type="button"
                  :disabled="busy === it.id"
                  @click="setStatus(it, 'aktif')"
                >
                  Aktifkan
                </button>
              </td>
            </tr>

            <tr v-if="!items.length">
              <td :colspan="canWrite ? 5 : 4" class="p-8 text-center muted">
                Belum ada agenda untuk filter ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal / form tambah agenda -->
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.6)"
        @click.self="closeForm()"
      >
        <div class="card w-full max-w-lg" style="background: var(--surface)">
          <h2 class="font-display text-lg font-bold mb-4">Tambah Agenda</h2>

          <form class="space-y-3" @submit.prevent="submitForm()">
            <!-- Judul -->
            <div>
              <label class="block text-xs muted mb-1">Judul <span class="text-red-400">*</span></label>
              <input
                v-model="form.judul"
                type="text"
                class="w-full rounded px-3 py-2 text-sm"
                style="background: var(--input-bg, var(--bg)); border: 1px solid var(--border); color: var(--fg)"
                placeholder="Contoh: Rapat RT 01"
                required
                maxlength="120"
              />
            </div>

            <!-- Tanggal + waktu -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs muted mb-1">Tanggal <span class="text-red-400">*</span></label>
                <input
                  v-model="form.tanggal"
                  type="date"
                  class="w-full rounded px-3 py-2 text-sm"
                  style="background: var(--input-bg, var(--bg)); border: 1px solid var(--border); color: var(--fg)"
                  required
                />
              </div>
              <div>
                <label class="block text-xs muted mb-1">Waktu (opsional)</label>
                <input
                  v-model="form.waktu"
                  type="time"
                  class="w-full rounded px-3 py-2 text-sm"
                  style="background: var(--input-bg, var(--bg)); border: 1px solid var(--border); color: var(--fg)"
                />
              </div>
            </div>

            <!-- Lokasi -->
            <div>
              <label class="block text-xs muted mb-1">Lokasi (opsional)</label>
              <input
                v-model="form.lokasi"
                type="text"
                class="w-full rounded px-3 py-2 text-sm"
                style="background: var(--input-bg, var(--bg)); border: 1px solid var(--border); color: var(--fg)"
                placeholder="Contoh: Balai Dusun"
                maxlength="120"
              />
            </div>

            <!-- Deskripsi -->
            <div>
              <label class="block text-xs muted mb-1">Deskripsi (opsional)</label>
              <textarea
                v-model="form.deskripsi"
                rows="3"
                class="w-full rounded px-3 py-2 text-sm resize-none"
                style="background: var(--input-bg, var(--bg)); border: 1px solid var(--border); color: var(--fg)"
                placeholder="Keterangan tambahan…"
                maxlength="500"
              />
            </div>

            <!-- Error -->
            <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

            <!-- Tombol -->
            <div class="flex justify-end gap-2 pt-1">
              <button
                type="button"
                class="btn btn-ghost text-sm"
                @click="closeForm()"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary text-sm"
                :disabled="formBusy"
              >
                {{ formBusy ? 'Menyimpan…' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Agenda' })

const auth = useAuthStore()

// canWrite: admin atau super_admin
const canWrite = computed(() =>
  auth.user?.role === 'admin' || auth.user?.role === 'super_admin',
)

// ── filter ──────────────────────────────────────────────
const filterOptions = [
  { value: '', label: 'Semua' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'batal', label: 'Batal' },
]
const filter = ref('aktif')

function setFilter(v: string) {
  filter.value = v
  load()
}

// ── data ─────────────────────────────────────────────────
const items = ref<any[]>([])
const busy = ref<string | null>(null)

async function load() {
  const q: Record<string, string> = {}
  if (filter.value) q.status = filter.value
  const res = await $fetch<any>('/api/agenda', { query: q })
  items.value = res.items || []
}

// ── status update ─────────────────────────────────────────
async function setStatus(it: any, status: string) {
  busy.value = it.id
  try {
    await $fetch('/api/agenda', {
      method: 'POST',
      body: { action: 'update_status', id: it.id, status },
    })
    await load()
  } finally {
    busy.value = null
  }
}

// ── form tambah ───────────────────────────────────────────
const showForm = ref(false)
const formBusy = ref(false)
const formError = ref('')

const emptyForm = () => ({
  judul: '',
  tanggal: new Date().toISOString().slice(0, 10),
  waktu: '',
  lokasi: '',
  deskripsi: '',
})

const form = ref(emptyForm())

function openForm() {
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  formError.value = ''
}

async function submitForm() {
  formError.value = ''
  if (form.value.judul.trim().length < 3) {
    formError.value = 'Judul minimal 3 karakter.'
    return
  }
  if (!form.value.tanggal) {
    formError.value = 'Tanggal harus diisi.'
    return
  }
  formBusy.value = true
  try {
    await $fetch('/api/agenda', {
      method: 'POST',
      body: {
        judul: form.value.judul.trim(),
        tanggal: form.value.tanggal,
        waktu: form.value.waktu || undefined,
        lokasi: form.value.lokasi.trim() || undefined,
        deskripsi: form.value.deskripsi.trim() || undefined,
      },
    })
    closeForm()
    // Setelah tambah, tampilkan semua / aktif
    filter.value = 'aktif'
    await load()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Gagal menyimpan agenda.'
  } finally {
    formBusy.value = false
  }
}

// ── format tanggal ────────────────────────────────────────
function formatTanggal(iso: string) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ── status badge color ────────────────────────────────────
function statusClass(status: string) {
  if (status === 'aktif') return 'bg-emerald-500/20 text-emerald-400'
  if (status === 'selesai') return 'bg-blue-500/20 text-blue-400'
  if (status === 'batal') return 'bg-red-500/20 text-red-400'
  return 'bg-zinc-500/20 text-zinc-400'
}

// ── init ──────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
