<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="font-display text-2xl font-bold">Privasi & kepatuhan</h1>
    <p class="text-sm muted mt-1">
      Ringkasan kebijakan data pribadi sistem pendataan warga padukuhan.
    </p>

    <div class="card p-5 mt-6 space-y-4 text-sm leading-relaxed">
      <p>
        Data NIK, No. KK, alamat, dan nomor HP warga <strong>tidak dipublikasikan</strong> di website
        publik. Yang tampil di beranda/statistik hanyalah agregat (jumlah jiwa, KK, demografi).
      </p>
      <p>
        Akses data rinci hanya melalui <code class="text-xs">/ops</code> (unlisted) dengan login
        pengelola. Sesi berakhir otomatis; login dibatasi rate-limit anti-bruteforce.
      </p>
      <p>
        Backup JSON berisi data sensitif — simpan di drive terenkripsi padukuhan. Jangan unggah ke
        chat publik atau media sosial.
      </p>
      <p>
        Soft-delete warga menyimpan jejak untuk audit. Log aktivitas mencatat aksi pengelola (tanpa
        menyimpan password).
      </p>
      <p class="muted text-xs">
        Produk multi-tenant: setiap padukuhan/desa dapat punya branding & sheet sendiri. White-label
        onboarding tersedia untuk super admin.
      </p>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
      <NuxtLink class="btn btn-ghost text-sm" to="/">Beranda</NuxtLink>
      <NuxtLink class="btn btn-ghost text-sm" to="/layanan">Portal warga</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Privasi' })
</script>
