<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else-if="!auth.isAdmin" class="muted">Halaman ini hanya untuk Admin.</div>
    <div v-else>
      <!-- Toolbar: judul + tombol cetak -->
      <div class="flex flex-wrap items-start justify-between gap-3 mb-6 no-print">
        <div>
          <h1 class="font-display text-2xl font-bold">Rekap Pejabat</h1>
          <p class="text-sm muted mt-1">Laporan data kependudukan untuk keperluan dukuh / kalurahan</p>
        </div>
        <button class="btn btn-primary" type="button" @click="onCetak">
          🖨 Cetak / Export PDF
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="muted text-sm py-8 text-center">Memuat data…</div>
      <div v-else-if="error" class="text-sm py-8 text-center" style="color: var(--danger, #ef4444)">
        Gagal memuat data. <button class="underline" type="button" @click="refresh">Coba lagi</button>
      </div>

      <template v-else-if="stats">
        <!-- ===== KOP SURAT (hanya tampil saat cetak) ===== -->
        <div class="print-kop">
          <div class="print-kop-title">{{ tenantName }}</div>
          <div class="print-kop-sub">Laporan Data Kependudukan — Rekap Pejabat</div>
          <div class="print-kop-meta">Tanggal cetak: {{ tanggalCetak }}</div>
          <hr class="print-kop-line" />
        </div>

        <!-- ===== SECTION 1: Ringkasan Umum ===== -->
        <section class="card p-5 mb-4">
          <h2 class="font-semibold mb-4">Ringkasan Umum</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="stat-box">
              <div class="stat-val">{{ stats.totalPenduduk.toLocaleString('id') }}</div>
              <div class="stat-lbl">Total Jiwa</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ stats.totalKk.toLocaleString('id') }}</div>
              <div class="stat-lbl">Kartu Keluarga</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ stats.laki.toLocaleString('id') }}</div>
              <div class="stat-lbl">Laki-laki</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ stats.perempuan.toLocaleString('id') }}</div>
              <div class="stat-lbl">Perempuan</div>
            </div>
          </div>
        </section>

        <!-- ===== SECTION 2: Rekap per RT ===== -->
        <section class="card p-5 mb-4">
          <h2 class="font-semibold mb-4">Rekap per RT</h2>
          <div class="table-wrap">
            <table class="rekap-tabel">
              <thead>
                <tr>
                  <th>RT</th>
                  <th class="num">Kartu Keluarga</th>
                  <th class="num">Jiwa</th>
                  <th class="num">Rata-rata/KK</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in stats.perRt" :key="r.rt">
                  <td>RT {{ r.rt }}</td>
                  <td class="num">{{ r.kk }}</td>
                  <td class="num">{{ r.jiwa }}</td>
                  <td class="num">{{ r.kk ? (r.jiwa / r.kk).toFixed(1) : '—' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td><strong>Total</strong></td>
                  <td class="num"><strong>{{ stats.totalKk }}</strong></td>
                  <td class="num"><strong>{{ stats.totalPenduduk }}</strong></td>
                  <td class="num"><strong>{{ stats.totalKk ? (stats.totalPenduduk / stats.totalKk).toFixed(1) : '—' }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <!-- ===== SECTION 3: Kelompok Umur ===== -->
        <section class="card p-5 mb-4">
          <h2 class="font-semibold mb-4">Kelompok Umur</h2>
          <div class="table-wrap">
            <table class="rekap-tabel">
              <thead>
                <tr>
                  <th>Kelompok</th>
                  <th class="num">Jumlah</th>
                  <th class="num">Persentase</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="g in kelompokUmur" :key="g.label">
                  <td>{{ g.label }}</td>
                  <td class="num">{{ g.count }}</td>
                  <td class="num">{{ stats.totalPenduduk ? ((g.count / stats.totalPenduduk) * 100).toFixed(1) + '%' : '—' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td><strong>Total</strong></td>
                  <td class="num"><strong>{{ stats.totalPenduduk }}</strong></td>
                  <td class="num"><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <!-- ===== SECTION 4: Agama ===== -->
        <section class="card p-5 mb-4">
          <h2 class="font-semibold mb-4">Agama</h2>
          <div class="table-wrap">
            <table class="rekap-tabel">
              <thead>
                <tr>
                  <th>Agama</th>
                  <th class="num">Jumlah</th>
                  <th class="num">Persentase</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in stats.agama" :key="a.label">
                  <td>{{ a.label }}</td>
                  <td class="num">{{ a.count }}</td>
                  <td class="num">{{ stats.totalPenduduk ? ((a.count / stats.totalPenduduk) * 100).toFixed(1) + '%' : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Footer info -->
        <p class="text-xs muted mt-2 no-print">
          Data diambil langsung dari sistem. Cetak menggunakan browser untuk hasil terbaik (File → Print atau Ctrl+P).
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Rekap Pejabat' })

const auth = useAuthStore()

interface PublicStats {
  totalPenduduk: number
  totalKk: number
  laki: number
  perempuan: number
  balita: number
  anak: number
  remaja: number
  dewasa: number
  lansia: number
  perRt: { rt: string; kk: number; jiwa: number }[]
  agama: { label: string; count: number }[]
  pendidikan: { label: string; count: number }[]
  mode: string
}

const stats = ref<PublicStats | null>(null)
const pending = ref(true)
const error = ref(false)

const tenantName = ref('Padukuhan Jetis Sumur')
const tanggalCetak = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const kelompokUmur = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Balita (0–4 th)', count: stats.value.balita },
    { label: 'Anak (5–14 th)', count: stats.value.anak },
    { label: 'Remaja (15–24 th)', count: stats.value.remaja },
    { label: 'Dewasa (25–59 th)', count: stats.value.dewasa },
    { label: 'Lansia (60+ th)', count: stats.value.lansia },
  ]
})

async function loadData() {
  pending.value = true
  error.value = false
  try {
    // Coba admin stats dulu, fallback ke publik
    const res = await $fetch<{ ok: boolean; stats: PublicStats }>('/api/stats?admin=1').catch(
      () => $fetch<{ ok: boolean; stats: PublicStats }>('/api/stats'),
    )
    stats.value = res.stats ?? null
    // Ambil nama padukuhan dari tenant
    const tenantRes = await $fetch<{ ok: boolean; tenant: { name: string } }>('/api/tenant').catch(() => null)
    if (tenantRes?.tenant?.name) tenantName.value = tenantRes.tenant.name
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function refresh() {
  loadData()
}

function onCetak() {
  window.print()
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  if (!auth.isAdmin) return
  await loadData()
})
</script>

<style scoped>
/* ── Stat boxes ─────────────────────────────────────────── */
.stat-box {
  background: var(--surface-soft, color-mix(in srgb, var(--surface) 60%, transparent));
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  text-align: center;
}
.stat-val {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.stat-lbl {
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 0.2rem;
}

/* ── Table ──────────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rekap-tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.rekap-tabel th,
.rekap-tabel td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: left;
  white-space: nowrap;
}
.rekap-tabel th {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: var(--surface-soft, color-mix(in srgb, var(--surface) 60%, transparent));
}
.rekap-tabel td.num,
.rekap-tabel th.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rekap-tabel .total-row td {
  border-top: 2px solid var(--border);
  border-bottom: none;
  background: var(--surface-soft, color-mix(in srgb, var(--surface) 60%, transparent));
}

/* ── Print styles ───────────────────────────────────────── */
.print-kop {
  display: none;
}

@media print {
  /* Sembunyikan UI ops */
  .no-print {
    display: none !important;
  }

  /* Tampilkan kop surat */
  .print-kop {
    display: block;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .print-kop-title {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .print-kop-sub {
    font-size: 0.95rem;
    margin-top: 0.15rem;
  }
  .print-kop-meta {
    font-size: 0.8rem;
    color: #555;
    margin-top: 0.2rem;
  }
  .print-kop-line {
    margin: 0.75rem 0;
    border: none;
    border-top: 2px solid #000;
  }

  /* Reset card borders untuk print */
  .card {
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    break-inside: avoid;
    margin-bottom: 1rem;
  }

  /* Tabel hitam-putih */
  .rekap-tabel th {
    background: #f0f0f0 !important;
    color: #000 !important;
  }
  .rekap-tabel .total-row td {
    background: #f0f0f0 !important;
  }

  /* Stat box untuk print */
  .stat-box {
    background: #f9f9f9 !important;
    border: 1px solid #ccc !important;
  }
  .stat-val {
    color: #000 !important;
  }
  .stat-lbl {
    color: #555 !important;
  }
}
</style>
