<template>
  <div class="container-page py-10">

    <!-- Hero -->
    <div class="mb-10">
      <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
        style="background: var(--accent-dim); color: var(--accent)">
        🏛 Layanan Publik
      </div>
      <h1 class="font-display text-3xl sm:text-4xl font-bold leading-tight">Layanan Padukuhan</h1>
      <p class="muted mt-3 max-w-xl text-sm leading-relaxed">
        Ajukan kebutuhan administrasi, pantau status pengajuan, dan perbarui data kependudukan —
        langsung dari perangkat Anda tanpa perlu antre di kantor padukuhan.
      </p>
    </div>

    <!-- 3 Kartu layanan -->
    <div class="grid gap-4 sm:grid-cols-3 mb-12">
      <div
        v-for="svc in services"
        :key="svc.id"
        class="card card-hover p-6 flex flex-col gap-3"
        :class="{ 'ring-1': activeSection === svc.id }"
        :style="activeSection === svc.id ? 'ring-color: var(--accent)' : ''"
      >
        <div class="text-3xl">{{ svc.icon }}</div>
        <div>
          <div class="font-semibold text-base">{{ svc.title }}</div>
          <p class="muted text-sm mt-1 leading-relaxed">{{ svc.desc }}</p>
        </div>
        <button
          class="btn btn-primary mt-auto text-sm"
          @click="handleCTA(svc.id)"
        >{{ svc.cta }}</button>
      </div>
    </div>

    <!-- Cara mengajukan -->
    <div class="mb-12">
      <h2 class="font-display text-xl font-bold mb-6">Cara mengajukan</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <div v-for="(step, i) in steps" :key="i" class="card p-5 flex gap-4">
          <div
            class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
            style="background: var(--accent-dim); color: var(--accent)"
          >{{ i + 1 }}</div>
          <div>
            <div class="font-semibold text-sm">{{ step.title }}</div>
            <p class="muted text-xs mt-1 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form pengajuan (accordion) -->
    <div v-if="activeSection === 'ajukan'" class="mb-12">
      <h2 class="font-display text-xl font-bold mb-5">Form Pengajuan</h2>

      <!-- Sukses state -->
      <div v-if="submitOk" class="card p-6 space-y-3">
        <div class="text-2xl">✅</div>
        <div class="font-semibold text-base">Pengajuan berhasil dikirim!</div>
        <div class="card p-4" style="background: var(--accent-dim)">
          <div class="text-xs muted mb-1">Kode ID Pengajuan Anda</div>
          <div class="font-mono font-bold text-lg" style="color: var(--accent)">{{ submittedId }}</div>
        </div>
        <p class="text-sm muted leading-relaxed">
          Simpan kode ID di atas. Gunakan kode tersebut di bagian
          <strong>Cek Status</strong> di bawah untuk memantau perkembangan pengajuan Anda.
          Perangkat padukuhan akan menindaklanjuti dalam 1–3 hari kerja.
        </p>
        <div class="flex gap-2 pt-1">
          <button class="btn btn-primary text-sm" @click="scrollToStatus">Cek Status Sekarang</button>
          <button class="btn btn-ghost text-sm" @click="resetForm">Ajukan Lagi</button>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="card p-6 space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="label">Jenis Layanan</label>
            <select v-model="form.jenis" class="input">
              <option value="surat_domisili">Surat Keterangan Domisili</option>
              <option value="surat_usaha">Surat Keterangan Usaha</option>
              <option value="surat_tidak_mampu">Surat Keterangan Tidak Mampu</option>
              <option value="surat_pengantar">Surat Pengantar (Umum)</option>
              <option value="update_data">Update Data Pribadi / KK</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label class="label">Nama Lengkap</label>
            <input v-model="form.nama" class="input" required minlength="3" placeholder="Sesuai KTP" />
          </div>
          <div>
            <label class="label">NIK (16 digit)</label>
            <input
              v-model="form.nik"
              class="input font-mono"
              required
              pattern="\d{16}"
              maxlength="16"
              placeholder="3401xxxxxxxxxxxxxxxx"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="label">No. HP / WA <span class="muted font-normal">(opsional, untuk notifikasi)</span></label>
            <input v-model="form.noHp" class="input" placeholder="08xxxxxxxxxx" />
          </div>
          <div class="sm:col-span-2">
            <label class="label">Keperluan</label>
            <input
              v-model="form.keperluan"
              class="input"
              required
              minlength="5"
              placeholder="Contoh: Untuk melamar kerja di PT. Maju Jaya"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="label">Detail Tambahan <span class="muted font-normal">(opsional)</span></label>
            <textarea
              v-model="form.detail"
              class="input min-h-[90px] resize-y"
              placeholder="Informasi tambahan yang perlu diketahui perangkat padukuhan…"
            />
          </div>
        </div>

        <p v-if="submitMsg && !submitOk" class="text-sm" style="color: var(--danger)">
          ⚠ {{ submitMsg }}
        </p>

        <div class="flex gap-3 pt-1">
          <button class="btn btn-primary" type="submit" :disabled="submitBusy">
            {{ submitBusy ? 'Mengirim…' : 'Kirim Pengajuan' }}
          </button>
          <button class="btn btn-ghost text-sm" type="button" @click="activeSection = null">
            Batal
          </button>
        </div>
      </form>
    </div>

    <!-- Cek status -->
    <div id="cek-status" class="mb-4">
      <h2 class="font-display text-xl font-bold mb-2">Cek Status Pengajuan</h2>
      <p class="muted text-sm mb-5">Masukkan kode ID yang Anda terima setelah mengirim pengajuan.</p>

      <div class="card p-6">
        <div class="flex gap-2">
          <input
            v-model="statusId"
            class="input flex-1 font-mono"
            placeholder="Contoh: PRT-20240001"
            @keydown.enter.prevent="cekStatus"
          />
          <button
            class="btn btn-primary px-5"
            :disabled="statusBusy || !statusId.trim()"
            @click="cekStatus"
          >
            {{ statusBusy ? '…' : 'Cek' }}
          </button>
        </div>

        <!-- Hasil status -->
        <div v-if="statusResult" class="mt-5 space-y-2">
          <div class="flex items-center gap-2">
            <span
              class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :style="statusBadgeStyle(statusResult.status)"
            >{{ statusResult.status || 'menunggu' }}</span>
            <span class="text-xs muted">ID: {{ statusResult.id }}</span>
          </div>
          <div class="text-sm font-medium">{{ statusResult.jenis?.replace(/_/g, ' ') }}</div>
          <div class="text-sm muted">Nama: {{ statusResult.nama }}</div>
          <div v-if="statusResult.keperluan" class="text-sm muted">Keperluan: {{ statusResult.keperluan }}</div>
          <div v-if="statusResult.catatan" class="card p-3 text-sm" style="background: var(--accent-dim)">
            📝 Catatan perangkat: {{ statusResult.catatan }}
          </div>
        </div>

        <p v-if="statusMsg && !statusResult" class="mt-4 text-sm" style="color: var(--danger)">
          {{ statusMsg }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Layanan',
  meta: [
    {
      name: 'description',
      content: 'Layanan administrasi dan surat keterangan Padukuhan Jetis Sumur — ajukan online, pantau status, dan perbarui data kependudukan tanpa antre',
    },
  ],
})

const services = [
  {
    id: 'ajukan',
    icon: '📄',
    title: 'Pengajuan Surat',
    desc: 'Ajukan surat keterangan domisili, usaha, tidak mampu, pengantar, dan lainnya secara online.',
    cta: 'Ajukan Sekarang',
  },
  {
    id: 'status',
    icon: '🔍',
    title: 'Cek Status Pengajuan',
    desc: 'Pantau perkembangan pengajuan Anda menggunakan kode ID yang diberikan saat pengajuan.',
    cta: 'Cek Status',
  },
  {
    id: 'update',
    icon: '✏️',
    title: 'Update Data',
    desc: 'Perbarui data pribadi atau data anggota keluarga. Perangkat padukuhan akan memverifikasi.',
    cta: 'Update Data',
  },
]

const steps = [
  {
    title: 'Isi formulir',
    desc: 'Lengkapi data diri dan jenis layanan yang diperlukan. NIK wajib diisi untuk verifikasi.',
  },
  {
    title: 'Kirim & catat ID',
    desc: 'Setelah mengirim, Anda mendapat kode ID unik. Simpan kode ini untuk cek status.',
  },
  {
    title: 'Tunggu proses',
    desc: 'Perangkat padukuhan memproses dalam 1–3 hari kerja. Pantau statusnya kapan saja.',
  },
]

// Section state
const activeSection = ref<string | null>(null)

function handleCTA(id: string) {
  // BUG-015: reset cek-status state when opening a new form
  statusResult.value = null
  statusMsg.value = ''
  statusId.value = ''
  if (id === 'status') {
    activeSection.value = null
    scrollToStatus()
  } else if (id === 'update') {
    activeSection.value = 'ajukan'
    form.jenis = 'update_data'
    nextTick(() => window.scrollTo({ top: document.getElementById('form-pengajuan')?.offsetTop ?? 0, behavior: 'smooth' }))
  } else {
    activeSection.value = id
    form.jenis = 'surat_pengantar'
  }
}

function scrollToStatus() {
  nextTick(() => {
    const el = document.getElementById('cek-status')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// Form state
const form = reactive({
  jenis: 'surat_pengantar',
  nama: '',
  nik: '',
  noHp: '',
  keperluan: '',
  detail: '',
})
const submitBusy = ref(false)
const submitMsg = ref('')
const submitOk = ref(false)
const submittedId = ref('')

async function submit() {
  submitBusy.value = true
  submitMsg.value = ''
  try {
    const res = await $fetch<any>('/api/portal', { method: 'POST', body: { ...form } })
    submittedId.value = res.item?.id || res.id || '—'
    submitOk.value = true
  } catch (e: any) {
    submitMsg.value = e?.data?.statusMessage || e?.message || 'Gagal mengirim. Coba lagi beberapa saat.'
  } finally {
    submitBusy.value = false
  }
}

function resetForm() {
  submitOk.value = false
  submitMsg.value = ''
  submittedId.value = ''
  form.nama = ''
  form.nik = ''
  form.noHp = ''
  form.keperluan = ''
  form.detail = ''
}

// Cek status state
const statusId = ref('')
const statusBusy = ref(false)
const statusMsg = ref('')
const statusResult = ref<any>(null)

async function cekStatus() {
  if (!statusId.value.trim()) return
  statusBusy.value = true
  statusMsg.value = ''
  statusResult.value = null
  try {
    const res = await $fetch<any>(`/api/portal?id=${encodeURIComponent(statusId.value.trim())}`)
    if (res?.item) {
      statusResult.value = res.item
    } else if (res?.id) {
      statusResult.value = res
    } else {
      statusMsg.value = 'Data tidak ditemukan. Periksa kembali kode ID Anda.'
    }
  } catch (e: any) {
    const raw = e?.data?.statusMessage || e?.data?.message || ''
    const errMap: Record<string, string> = {
      unauthorized: 'Kode tidak ditemukan atau akses ditolak. Pastikan kode pengajuan benar.',
      not_found: 'Pengajuan dengan kode ini tidak ditemukan.',
    }
    statusMsg.value = errMap[raw] ?? (raw || 'Gagal mengambil data. Periksa kembali kode ID.')
  } finally {
    statusBusy.value = false
  }
}

function statusBadgeStyle(status: string) {
  const map: Record<string, string> = {
    menunggu: 'background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b',
    diproses: 'background: color-mix(in srgb, #3b82f6 15%, transparent); color: #3b82f6',
    selesai: 'background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent)',
    ditolak: 'background: color-mix(in srgb, var(--danger) 15%, transparent); color: var(--danger)',
  }
  return map[status] ?? map.menunggu
}
</script>
