<template>
  <div>
    <!-- Akses ditolak -->
    <div v-if="!auth.user || !auth.isSuper" class="card p-6 text-center">
      <p class="muted">Halaman ini hanya untuk Super Admin.</p>
      <NuxtLink to="/ops" class="btn btn-ghost text-sm mt-3">← Kembali</NuxtLink>
    </div>

    <!-- Wizard -->
    <div v-else>
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 class="font-display text-2xl font-bold">Setup Padukuhan Baru</h1>
          <p class="text-sm muted mt-1">Wizard onboarding multi-tenant — 3 langkah</p>
        </div>
        <NuxtLink to="/ops" class="btn btn-ghost text-sm">← Kembali</NuxtLink>
      </div>

      <!-- Progress bar -->
      <div class="mb-6">
        <div class="flex gap-1 mb-2">
          <span
            v-for="s in 3"
            :key="s"
            class="text-xs font-medium px-1"
            :class="step >= s ? 'text-[var(--accent)]' : 'muted'"
          >
            Langkah {{ s }}
          </span>
        </div>
        <div class="h-2 rounded-full overflow-hidden" style="background: var(--border)">
          <div
            class="h-full rounded-full transition-all duration-300"
            style="background: var(--accent)"
            :style="{ width: `${(step / 3) * 100}%` }"
          />
        </div>
        <div class="flex justify-between text-xs muted mt-1">
          <span>Identitas</span>
          <span>Akun Admin</span>
          <span>Konfirmasi</span>
        </div>
      </div>

      <!-- Step 1: Identitas Padukuhan -->
      <div v-if="step === 1" class="card p-6 space-y-4">
        <h2 class="font-semibold text-lg">Langkah 1 — Identitas Padukuhan</h2>

        <div>
          <label class="label">Nama Padukuhan <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.name"
            class="input"
            placeholder="Contoh: Padukuhan Jetis Sumur"
            maxlength="80"
          />
          <p v-if="errors.name" class="text-xs mt-1" style="color:var(--danger)">{{ errors.name }}</p>
        </div>

        <div>
          <label class="label">Nama Singkat (shortName) <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.shortName"
            class="input"
            placeholder="Contoh: Jetis Sumur"
            maxlength="40"
          />
          <p v-if="errors.shortName" class="text-xs mt-1" style="color:var(--danger)">{{ errors.shortName }}</p>
        </div>

        <div>
          <label class="label">Logo Text (2 huruf) <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.logoText"
            class="input uppercase"
            placeholder="JS"
            maxlength="2"
            style="width: 5rem; text-align: center; font-weight: 700; font-size: 1.25rem; letter-spacing: 0.05em"
          />
          <p class="text-xs muted mt-1">Akan dipakai sebagai avatar/ikon padukuhan</p>
          <p v-if="errors.logoText" class="text-xs mt-1" style="color:var(--danger)">{{ errors.logoText }}</p>
        </div>

        <div>
          <label class="label">Tagline</label>
          <input
            v-model="form.tagline"
            class="input"
            placeholder="Sistem pendataan warga digital"
            maxlength="120"
          />
        </div>

        <div>
          <label class="label">Alamat</label>
          <textarea
            v-model="form.alamat"
            class="input"
            rows="2"
            placeholder="Alamat lengkap padukuhan"
          />
        </div>

        <div>
          <label class="label">Jumlah RT <span style="color:var(--danger)">*</span></label>
          <input
            v-model.number="form.jumlahRt"
            type="number"
            class="input"
            min="1"
            max="20"
            placeholder="Contoh: 4"
            style="width: 8rem"
          />
          <p class="text-xs muted mt-1">Akan membuat daftar RT 01 s/d RT {{ String(form.jumlahRt || 1).padStart(2, '0') }}</p>
          <p v-if="errors.jumlahRt" class="text-xs mt-1" style="color:var(--danger)">{{ errors.jumlahRt }}</p>
        </div>

        <div class="flex justify-end pt-2">
          <button class="btn btn-primary" type="button" @click="nextStep">
            Lanjut →
          </button>
        </div>
      </div>

      <!-- Step 2: Akun Admin -->
      <div v-if="step === 2" class="card p-6 space-y-4">
        <h2 class="font-semibold text-lg">Langkah 2 — Akun Admin</h2>
        <p class="text-sm muted">Akun ini akan dipakai untuk login pertama kali setelah setup selesai.</p>

        <div>
          <label class="label">Nama Admin <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.adminNama"
            class="input"
            placeholder="Nama lengkap admin"
            maxlength="80"
          />
          <p v-if="errors.adminNama" class="text-xs mt-1" style="color:var(--danger)">{{ errors.adminNama }}</p>
        </div>

        <div>
          <label class="label">Username <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.adminUsername"
            class="input"
            placeholder="Contoh: admin.jetis"
            maxlength="40"
            autocomplete="off"
          />
          <p v-if="errors.adminUsername" class="text-xs mt-1" style="color:var(--danger)">{{ errors.adminUsername }}</p>
        </div>

        <div>
          <label class="label">Password <span style="color:var(--danger)">*</span></label>
          <div class="relative">
            <input
              v-model="form.adminPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="Min. 8 karakter"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-xs muted px-1"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
          </div>
          <p v-if="errors.adminPassword" class="text-xs mt-1" style="color:var(--danger)">{{ errors.adminPassword }}</p>
        </div>

        <div>
          <label class="label">Konfirmasi Password <span style="color:var(--danger)">*</span></label>
          <input
            v-model="form.adminPasswordConfirm"
            type="password"
            class="input"
            placeholder="Ulangi password"
            autocomplete="new-password"
          />
          <p v-if="errors.adminPasswordConfirm" class="text-xs mt-1" style="color:var(--danger)">{{ errors.adminPasswordConfirm }}</p>
        </div>

        <div class="flex justify-between pt-2">
          <button class="btn btn-ghost" type="button" @click="step = 1">← Kembali</button>
          <button class="btn btn-primary" type="button" @click="nextStep">Lanjut →</button>
        </div>
      </div>

      <!-- Step 3: Konfirmasi -->
      <div v-if="step === 3" class="card p-6 space-y-5">
        <h2 class="font-semibold text-lg">Langkah 3 — Konfirmasi</h2>
        <p class="text-sm muted">Periksa kembali sebelum menyimpan.</p>

        <div class="space-y-3">
          <div class="p-4 rounded-lg space-y-2" style="background: var(--surface-2, var(--bg)); border: 1px solid var(--border)">
            <h3 class="font-semibold text-sm muted uppercase tracking-wide">Identitas Padukuhan</h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt class="muted">Nama</dt>
              <dd class="font-medium">{{ form.name }}</dd>
              <dt class="muted">Nama Singkat</dt>
              <dd>{{ form.shortName }}</dd>
              <dt class="muted">Logo Text</dt>
              <dd class="font-bold uppercase">{{ form.logoText }}</dd>
              <dt class="muted">Tagline</dt>
              <dd>{{ form.tagline || '—' }}</dd>
              <dt class="muted">Alamat</dt>
              <dd>{{ form.alamat || '—' }}</dd>
              <dt class="muted">Jumlah RT</dt>
              <dd>{{ form.jumlahRt }} RT</dd>
            </dl>
          </div>

          <div class="p-4 rounded-lg space-y-2" style="background: var(--surface-2, var(--bg)); border: 1px solid var(--border)">
            <h3 class="font-semibold text-sm muted uppercase tracking-wide">Akun Admin</h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt class="muted">Nama</dt>
              <dd class="font-medium">{{ form.adminNama }}</dd>
              <dt class="muted">Username</dt>
              <dd class="font-mono">{{ form.adminUsername }}</dd>
              <dt class="muted">Password</dt>
              <dd class="font-mono">••••••••</dd>
            </dl>
          </div>
        </div>

        <p v-if="error" class="text-sm p-3 rounded" style="background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger)">
          {{ error }}
        </p>

        <!-- Draft result dari server -->
        <div v-if="draftResult" class="p-4 rounded-lg space-y-3" style="background: color-mix(in srgb, var(--accent) 8%, transparent); border: 1px solid var(--accent)">
          <p class="font-semibold text-sm" style="color: var(--accent)">✓ Draft berhasil dibuat!</p>
          <p class="text-sm muted">Slug: <code class="font-mono text-xs">{{ draftResult.id }}</code></p>
          <div class="text-sm space-y-1">
            <p class="font-medium">Checklist selanjutnya:</p>
            <ol class="list-decimal list-inside space-y-1 muted text-xs">
              <li v-for="(c, i) in draftResult.checklist" :key="i">{{ c }}</li>
            </ol>
          </div>
        </div>

        <div class="flex justify-between pt-2">
          <button class="btn btn-ghost" type="button" :disabled="loading" @click="step = 2">
            ← Kembali
          </button>
          <button
            v-if="!draftResult"
            class="btn btn-primary"
            type="button"
            :disabled="loading"
            @click="submit"
          >
            {{ loading ? 'Menyimpan…' : 'Selesai' }}
          </button>
          <NuxtLink v-else to="/ops" class="btn btn-primary">
            Ke Dashboard →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Onboard Padukuhan — Ops' })

const auth = useAuthStore()

// Form state
const step = ref(1)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const draftResult = ref<{ id: string; checklist: string[] } | null>(null)

const form = reactive({
  // Step 1
  name: '',
  shortName: '',
  logoText: '',
  tagline: '',
  alamat: '',
  jumlahRt: 4,
  // Step 2
  adminNama: '',
  adminUsername: '',
  adminPassword: '',
  adminPasswordConfirm: '',
})

const errors = reactive<Record<string, string>>({})

function clearErrors() {
  for (const k in errors) delete errors[k]
}

function validateStep1(): boolean {
  clearErrors()
  let ok = true
  if (!form.name.trim() || form.name.trim().length < 3) {
    errors.name = 'Nama padukuhan minimal 3 karakter'
    ok = false
  }
  if (!form.shortName.trim() || form.shortName.trim().length < 2) {
    errors.shortName = 'Nama singkat minimal 2 karakter'
    ok = false
  }
  if (!form.logoText.trim() || form.logoText.trim().length < 1) {
    errors.logoText = 'Logo text wajib diisi (1–2 huruf)'
    ok = false
  }
  if (!form.jumlahRt || form.jumlahRt < 1 || form.jumlahRt > 20) {
    errors.jumlahRt = 'Jumlah RT harus antara 1–20'
    ok = false
  }
  return ok
}

function validateStep2(): boolean {
  clearErrors()
  let ok = true
  if (!form.adminNama.trim() || form.adminNama.trim().length < 2) {
    errors.adminNama = 'Nama admin minimal 2 karakter'
    ok = false
  }
  if (!form.adminUsername.trim() || form.adminUsername.trim().length < 3) {
    errors.adminUsername = 'Username minimal 3 karakter'
    ok = false
  }
  if (!form.adminPassword || form.adminPassword.length < 8) {
    errors.adminPassword = 'Password minimal 8 karakter'
    ok = false
  }
  if (form.adminPassword !== form.adminPasswordConfirm) {
    errors.adminPasswordConfirm = 'Konfirmasi password tidak cocok'
    ok = false
  }
  return ok
}

function nextStep() {
  if (step.value === 1 && !validateStep1()) return
  if (step.value === 2 && !validateStep2()) return
  step.value++
}

// Build rtList dari jumlahRt
function buildRtList(): string[] {
  return Array.from({ length: form.jumlahRt }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  )
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ ok: boolean; draft: { id: string; checklist?: string[] }; checklist: string[] }>(
      '/api/onboard',
      {
        method: 'POST',
        body: {
          name: form.name.trim(),
          shortName: form.shortName.trim(),
          alamat: form.alamat.trim(),
          rtList: buildRtList(),
          // tagline + logoText bisa ditambah ke server nanti;
          // saat ini server tidak memakainya tapi tidak menolaknya
          tagline: form.tagline.trim() || undefined,
          logoText: form.logoText.trim().toUpperCase() || undefined,
          // Catatan: server V1 hanya membuat draft config;
          // field adminNama/adminUsername/adminPassword tercatat di checklist manual
          adminNama: form.adminNama.trim(),
          adminUsername: form.adminUsername.trim(),
        },
      },
    )
    if (res.ok) {
      draftResult.value = {
        id: res.draft.id,
        checklist: res.checklist || [],
      }
    }
  } catch (e: any) {
    const msg = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Gagal menyimpan'
    error.value = `Error: ${msg}`
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) navigateTo('/ops')
})
</script>
