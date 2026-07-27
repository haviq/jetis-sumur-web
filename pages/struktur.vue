<template>
  <div class="container-page py-10 sm:py-12">

    <!-- Header -->
    <div class="mb-10">
      <div
        class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
        style="background: var(--accent-dim); color: var(--accent)"
      >
        🏛 Organisasi
      </div>
      <h1 class="font-display text-3xl sm:text-4xl font-bold">Struktur Organisasi</h1>
      <p class="muted mt-3 max-w-xl text-sm leading-relaxed">
        Perangkat Padukuhan Jetis Sumur, Kalurahan Sendangtirto, Kapanewon Berbah,
        D.I. Yogyakarta — periode berjalan.
      </p>
    </div>

    <!-- Grid perangkat -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
      <div
        v-for="p in displayPerangkat"
        :key="p.jabatan"
        class="card card-hover p-5 flex gap-4 items-start"
      >
        <!-- Avatar inisial -->
        <div
          class="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold"
          style="background: var(--accent-dim); color: var(--accent)"
        >
          {{ initials(p.nama) }}
        </div>

        <div class="min-w-0">
          <!-- Badge jabatan -->
          <div
            class="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
            style="background: var(--surface-2, var(--border)); color: var(--muted)"
          >
            {{ p.jabatan }}
          </div>
          <!-- Nama -->
          <div class="font-semibold text-base leading-snug truncate">
            {{ p.nama === '—' ? '— (belum diisi)' : p.nama }}
          </div>
          <!-- Sub-info jika ada -->
          <div v-if="p.kontak" class="text-xs muted mt-1">📱 {{ p.kontak }}</div>
        </div>
      </div>
    </div>

    <!-- Section Kontak Darurat -->
    <div>
      <h2 class="font-display text-xl font-bold mb-2">Kontak Darurat</h2>
      <p class="muted text-sm mb-5">
        Hubungi Ketua RT setempat untuk kebutuhan mendesak di lingkungan Anda.
      </p>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="rt in kontakDarurat"
          :key="rt.rt"
          class="card p-4 flex gap-3 items-center"
        >
          <div
            class="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold"
            style="background: var(--accent-dim); color: var(--accent)"
          >
            {{ rt.rt }}
          </div>
          <div>
            <div class="text-xs muted uppercase tracking-wide">Ketua {{ rt.rt }}</div>
            <div class="font-semibold text-sm mt-0.5">{{ rt.nama }}</div>
            <div class="text-xs muted mt-0.5">📱 {{ rt.hp }}</div>
          </div>
        </div>
      </div>
      <p class="text-xs muted mt-4">
        * Nomor HP bersifat placeholder. Hubungi perangkat padukuhan untuk memperbarui data.
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Struktur Organisasi' })

// Fallback hardcode
const fallbackPerangkat = [
  { jabatan: 'Dukuh', nama: '—' },
  { jabatan: 'Sekretaris', nama: '—' },
  { jabatan: 'Ketua RT 01', nama: '—' },
  { jabatan: 'Ketua RT 02', nama: '—' },
  { jabatan: 'Ketua RT 03', nama: '—' },
  { jabatan: 'Ketua RT 04', nama: '—' },
]

// Coba fetch dari /api/master?kategori=perangkat
// API ini memerlukan auth, jadi error 401 adalah expected di publik — gracefully fallback
const { data: masterData } = await useFetch<{ ok: boolean; items: any[] }>(
  '/api/master',
  {
    query: { kategori: 'perangkat' },
    // Jangan throw error, cukup kembalikan null
    onResponseError: () => {},
  },
).catch(() => ({ data: ref(null) }))

// Mapping dari item master API ke format display
function mapMasterItem(item: any) {
  return {
    jabatan: item.jabatan || item.nilai || item.label || item.kategori || '—',
    nama: item.nama || item.keterangan || '—',
    kontak: item.kontak || item.hp || null,
  }
}

const displayPerangkat = computed(() => {
  const items = masterData?.value?.items
  if (items && Array.isArray(items) && items.length > 0) {
    return items.map(mapMasterItem)
  }
  return fallbackPerangkat
})

// Kontak darurat RT 01-04
const kontakDarurat = [
  { rt: 'RT 01', nama: '— (placeholder)', hp: '08xx-xxxx-xxxx' },
  { rt: 'RT 02', nama: '— (placeholder)', hp: '08xx-xxxx-xxxx' },
  { rt: 'RT 03', nama: '— (placeholder)', hp: '08xx-xxxx-xxxx' },
  { rt: 'RT 04', nama: '— (placeholder)', hp: '08xx-xxxx-xxxx' },
]

// Helper: ambil inisial dari nama
function initials(nama: string): string {
  if (!nama || nama === '—') return '?'
  return nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
</script>
