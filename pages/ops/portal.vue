<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Portal pengajuan</h1>
      <p class="text-sm muted mt-1">Antrian dari form publik /layanan — setujui / tolak.</p>

      <div class="flex flex-wrap gap-2 mt-4">
        <button
          v-for="s in statuses"
          :key="s"
          class="btn text-xs"
          :class="filter === s ? 'btn-primary' : 'btn-ghost'"
          type="button"
          @click=";(filter = s), load()"
        >
          {{ s }}
        </button>
      </div>

      <div class="card mt-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left muted border-b" style="border-color: var(--border)">
              <th class="p-3">Waktu</th>
              <th class="p-3">Nama / NIK</th>
              <th class="p-3">Kontak</th>
              <th class="p-3">Jenis</th>
              <th class="p-3">Keperluan</th>
              <th class="p-3">Status</th>
              <th class="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id" class="border-b" style="border-color: var(--border)">
              <td class="p-3 text-xs muted whitespace-nowrap">{{ formatWhen(it.createdAt) }}</td>
              <td class="p-3">
                <div class="font-medium">{{ it.nama }}</div>
                <div class="font-mono text-xs muted">{{ it.nik }}</div>
              </td>
              <td class="p-3">
                <div v-if="it.noHp" class="flex items-center gap-1.5">
                  <span class="text-xs font-mono">{{ it.noHp }}</span>
                  <button 
                    @click="sendWa(it)" 
                    title="Kirim Notifikasi WhatsApp"
                    class="inline-flex items-center justify-center p-1 rounded hover:bg-emerald-500/10 text-emerald-500"
                  >
                    💬
                  </button>
                </div>
                <div v-else class="text-xs muted">—</div>
              </td>
              <td class="p-3">{{ it.jenis }}</td>
              <td class="p-3 max-w-[220px]">{{ it.keperluan }}</td>
              <td class="p-3"><span class="badge">{{ it.status }}</span></td>
              <td class="p-3 space-x-1">
                <button class="btn btn-ghost text-xs" type="button" @click="setStatus(it, 'diproses')">Proses</button>
                <button class="btn btn-ghost text-xs" type="button" @click="setStatus(it, 'selesai')">Selesai</button>
                <button class="btn btn-ghost text-xs" type="button" @click="setStatus(it, 'ditolak')">Tolak</button>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="7" class="p-6 text-center muted">Kosong</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Portal' })
const auth = useAuthStore()
const items = ref<any[]>([])
const filter = ref('menunggu')
const statuses = ['menunggu', 'diproses', 'selesai', 'ditolak']

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  } catch {
    return iso
  }
}

async function load() {
  const res = await $fetch<any>('/api/portal', { query: { status: filter.value } })
  items.value = res.items || []
}

async function setStatus(it: any, status: string) {
  await $fetch('/api/portal', {
    method: 'POST',
    body: { action: 'update', id: it.id, status },
  })
  await load()
}

async function sendWa(it: any) {
  let template = ''
  if (it.status === 'menunggu') {
    template = `Halo ${it.nama}, pengajuan dokumen Anda (${it.keperluan}) telah kami terima dan sedang mengantri untuk diverifikasi. Terima kasih.`
  } else if (it.status === 'diproses') {
    template = `Halo ${it.nama}, pengajuan dokumen Anda (${it.keperluan}) sedang dalam proses pengerjaan oleh petugas. Terima kasih.`
  } else if (it.status === 'selesai') {
    template = `Halo ${it.nama}, pengajuan dokumen Anda (${it.keperluan}) telah SELESAI diproses. Silakan mengambil fisik dokumen di Balai Padukuhan Jetis Sumur, Glagaharjo pada jam layanan. Terima kasih.`
  } else if (it.status === 'ditolak') {
    template = `Halo ${it.nama}, pengajuan dokumen Anda (${it.keperluan}) belum dapat kami setujui. Mohon hubungi Balai Padukuhan untuk informasi lebih lanjut. Terima kasih.`
  } else {
    template = `Halo ${it.nama}, informasi mengenai pengajuan dokumen Anda (${it.keperluan}). Status saat ini: ${it.status}.`
  }

  try {
    const res = await $fetch<{ ok: boolean; url: string }>('/api/wa', {
      method: 'POST',
      body: { to: it.noHp, message: template, kind: 'portal_update' }
    })
    if (res.ok && res.url) {
      window.open(res.url, '_blank')
    }
  } catch (e: any) {
    alert(e.message || 'Gagal memicu tautan WhatsApp.')
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await load()
})
</script>
