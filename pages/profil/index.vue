<template>
  <div class="container-page py-10 sm:py-12">
    <h1 class="font-display text-3xl font-bold">Profil Padukuhan</h1>
    <p class="muted mt-2 max-w-2xl">{{ siteTagline }}</p>

    <div class="grid gap-4 mt-8 sm:grid-cols-2">
      <div class="card p-5 sm:p-6">
        <h2 class="font-semibold mb-4">Identitas wilayah</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Padukuhan</dt>
            <dd class="font-medium">{{ site.wilayah?.padukuhan || 'Jetis Sumur' }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Kabupaten</dt>
            <dd class="font-medium">{{ site.wilayah?.kabupaten || 'Sleman' }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Provinsi</dt>
            <dd class="font-medium">{{ site.wilayah?.provinsi || 'DI Yogyakarta' }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b pb-2" style="border-color: var(--border)">
            <dt class="muted">Jumlah RT</dt>
            <dd class="font-medium">{{ siteRt.length || 4 }} RT</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="muted">Jam layanan</dt>
            <dd class="font-medium text-right">{{ site.jamLayanan || 'Senin–Jumat 08.00–14.00' }}</dd>
          </div>
        </dl>
      </div>

      <div class="card p-5 sm:p-6">
        <h2 class="font-semibold mb-3">Tentang sistem</h2>
        <p class="text-sm muted leading-relaxed">
          Website ini menampilkan statistik agregat penduduk Padukuhan {{ site.wilayah?.padukuhan || 'Jetis Sumur' }}.
          NIK, nama lengkap, alamat detail, dan nomor HP tidak dipublikasikan.
          Pengelolaan data dilakukan perangkat padukuhan lewat dashboard terproteksi
          yang hanya diketahui pengelola.
        </p>
        <ul class="mt-4 space-y-2 text-sm">
          <li class="flex gap-2">
            <span style="color: var(--accent)">✓</span>
            Statistik publik real-time
          </li>
          <li class="flex gap-2">
            <span style="color: var(--accent)">✓</span>
            Data tersimpan di Google Spreadsheet
          </li>
          <li class="flex gap-2">
            <span style="color: var(--accent)">✓</span>
            Multi-role: padukuhan / admin / super admin
          </li>
          <li class="flex gap-2">
            <span style="color: var(--accent)">✓</span>
            Surat keterangan dengan QR verifikasi
          </li>
        </ul>
      </div>

      <div class="card p-5 sm:p-6 sm:col-span-2">
        <h2 class="font-semibold mb-3">Alamat</h2>
        <p class="text-sm muted">{{ siteAlamat }}</p>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="rt in (siteRt.length ? siteRt : ['01','02','03','04'])"
            :key="rt"
            class="card p-3 text-center text-sm"
            style="background: var(--accent-dim)"
          >
            <div class="font-bold" style="color: var(--accent)">RT {{ rt }}</div>
            <div class="muted text-xs mt-0.5">Jetis Sumur</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Profil' })
const { site, siteTagline, siteAlamat, siteRt } = useSite()
</script>
