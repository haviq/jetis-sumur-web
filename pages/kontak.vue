<template>
  <div class="container-page py-10">
    <h1 class="font-display text-3xl font-bold">Kontak</h1>
    <p class="muted mt-2">Hubungi balai padukuhan untuk layanan administrasi.</p>

    <div class="card p-6 mt-8 max-w-lg space-y-4 text-sm">
      <!-- Alamat -->
      <div>
        <span class="muted block mb-0.5">Alamat</span>
        <div class="font-medium">{{ siteAlamat }}</div>
      </div>

      <!-- Jam layanan -->
      <div>
        <span class="muted block mb-0.5">Jam layanan</span>
        <div class="font-medium">{{ site.jamLayanan }}</div>
      </div>

      <!-- Cara menghubungi -->
      <div>
        <span class="muted block mb-0.5">Cara menghubungi</span>
        <ul class="space-y-1 mt-1">
          <li class="flex gap-2">
            <span aria-hidden="true">🏛</span>
            Datang langsung ke balai padukuhan pada jam layanan
          </li>
          <li v-if="site.whatsapp" class="flex gap-2">
            <span aria-hidden="true">💬</span>
            WhatsApp:
            <a
              :href="`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`"
              class="underline"
              target="_blank"
              rel="noopener noreferrer"
            >{{ site.whatsapp }}</a>
          </li>
          <li v-if="site.email" class="flex gap-2">
            <span aria-hidden="true">✉️</span>
            Email:
            <a :href="`mailto:${site.email}`" class="underline">{{ site.email }}</a>
          </li>
        </ul>
      </div>

      <!-- Catatan privasi -->
      <div class="border-t pt-4" style="border-color: var(--border)">
        <span class="muted block mb-0.5">Catatan privasi</span>
        <div class="font-medium leading-relaxed">
          Data warga hanya untuk administrasi padukuhan. Tidak dipublikasikan.
          <NuxtLink to="/privasi" class="underline ml-1">Selengkapnya →</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kontak' })
const { site, siteAlamat } = useSite()
</script>
