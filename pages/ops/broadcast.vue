<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Broadcast WhatsApp (Gratis)</h1>
      <p class="text-sm muted mt-1">Kirim pesan massal secara berurutan ke warga menggunakan WhatsApp Web/App tanpa API berbayar.</p>

      <div class="grid gap-6 md:grid-cols-3 mt-6">
        <!-- Panel Kiri: Pengaturan & Template -->
        <div class="card p-5 md:col-span-1 space-y-4">
          <h2 class="font-semibold text-base border-b border-border pb-2">1. Pengaturan Pesan</h2>
          
          <div>
            <label class="block text-xs font-semibold uppercase muted mb-1.5">Target RT</label>
            <select v-model="filterRt" class="input text-sm w-full py-1.5 px-3">
              <option value="">Semua RT (Memiliki No HP)</option>
              <option value="01">RT 01</option>
              <option value="02">RT 02</option>
              <option value="03">RT 03</option>
              <option value="04">RT 04</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase muted mb-1.5">Template Pesan</label>
            <textarea 
              v-model="messageTemplate" 
              rows="6" 
              class="input text-sm w-full p-3 font-sans"
              placeholder="Halo {nama}, berikut informasi dari Padukuhan Jetis Sumur..."
            ></textarea>
            <div class="text-[11px] muted mt-1.5 leading-relaxed">
              Variabel yang didukung: <strong>{nama}</strong>, <strong>{nik}</strong>, <strong>{rt}</strong>
            </div>
          </div>

          <div class="pt-2">
            <button 
              @click="generateQueue" 
              :disabled="loading || !messageTemplate"
              class="btn btn-primary w-full py-2 text-sm font-semibold"
            >
              Mulai Antrean Broadcast
            </button>
          </div>
        </div>

        <!-- Panel Kanan: Antrean Pengiriman -->
        <div class="card p-5 md:col-span-2 space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-2">
            <h2 class="font-semibold text-base">2. Antrean Penerima ({{ queue.length }} Warga)</h2>
            <button 
              v-if="queue.length" 
              @click="resetQueue" 
              class="text-xs text-red-500 hover:underline font-semibold"
            >
              Reset Semua
            </button>
          </div>

          <!-- Queue List -->
          <div class="overflow-y-auto max-h-[400px] border border-border/10 rounded-lg">
            <table class="w-full text-sm text-left">
              <thead>
                <tr class="muted border-b border-border/20 text-xs uppercase bg-neutral-500/5">
                  <th class="p-3">Nama</th>
                  <th class="p-3">RT/RW</th>
                  <th class="p-3">No HP</th>
                  <th class="p-3">Status</th>
                  <th class="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, idx) in queue" 
                  :key="idx" 
                  class="border-b border-border/10 transition-colors"
                  :class="[
                    item.status === 'sent' ? 'opacity-40 bg-emerald-500/5' : '',
                    idx === activeIndex ? 'bg-primary/5 font-medium' : ''
                  ]"
                >
                  <td class="p-3">{{ item.nama }}</td>
                  <td class="p-3 font-mono text-xs">RT {{ item.rt }}/RW {{ item.rw }}</td>
                  <td class="p-3 font-mono text-xs">{{ item.noHp }}</td>
                  <td class="p-3">
                    <span 
                      class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                      :class="item.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'"
                    >
                      {{ item.status === 'sent' ? 'Terkirim' : 'Menunggu' }}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button 
                      @click="sendItem(idx)"
                      class="btn text-xs py-1 px-2.5 font-semibold"
                      :class="idx === activeIndex ? 'btn-primary' : 'btn-ghost'"
                    >
                      Kirim Notif 💬
                    </button>
                  </td>
                </tr>
                <tr v-if="!queue.length">
                  <td colspan="5" class="p-8 text-center muted text-sm">Belum ada antrean. Pilih target RT di sebelah kiri lalu klik "Mulai Antrean".</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Quick Actions -->
          <div v-if="queue.length && activeIndex !== null && activeIndex < queue.length" class="bg-neutral-500/5 p-4 rounded-lg flex items-center justify-between">
            <div class="text-sm">
              Antrean aktif: <strong class="text-primary">{{ queue[activeIndex].nama }}</strong>
            </div>
            <button @click="sendItem(activeIndex)" class="btn btn-primary py-1.5 px-4 text-xs font-bold">
              Kirim Ke Warga Aktif →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Broadcast WA' })

const auth = useAuthStore()
const filterRt = ref('')
const messageTemplate = ref('Halo {nama},\n\nBerikut kami sampaikan pengumuman penting dari Padukuhan Jetis Sumur, Glagaharjo.\n\n[Tulis pesan Anda di sini]\n\nTerima kasih.')
const loading = ref(false)

interface QueueItem {
  id: string
  nama: string
  nik: string
  rt: string
  rw: string
  noHp: string
  status: 'pending' | 'sent'
}

const queue = ref<QueueItem[]>([])
const activeIndex = ref<number | null>(null)

// Format nomor HP ke 62xxxx
function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0/, '62')
}

// Generate antrean berdasarkan RT
async function generateQueue() {
  loading.value = true
  queue.value = []
  activeIndex.value = null
  
  try {
    // 1. Fetch data warga & keluarga
    const [wargaRes, kkRes] = await Promise.all([
      $fetch<{ ok: boolean; items: any[] }>('/api/warga'),
      $fetch<{ ok: boolean; items: any[] }>('/api/keluarga')
    ])

    const warga = wargaRes.items || []
    const keluarga = kkRes.items || []
    
    // Map nomorKk ke data RT/RW
    const kkMap = new Map<string, any>()
    for (const k of keluarga) kkMap.set(k.nomorKk, k)

    const list: QueueItem[] = []
    
    // Cari warga yang memiliki no HP dan sesuai filter RT
    for (const w of warga) {
      if (!w.noHp) continue
      
      const kk = kkMap.get(w.nomorKk)
      const rt = kk?.rt || '01'
      const rw = kk?.rw || '09'

      if (filterRt.value && rt !== filterRt.value) continue

      list.push({
        id: w.id,
        nama: w.nama,
        nik: w.nik,
        rt,
        rw,
        noHp: w.noHp,
        status: 'pending'
      })
    }

    queue.value = list
    if (list.length > 0) activeIndex.value = 0
  } catch (e: any) {
    alert(e.message || 'Gagal membuat antrean.')
  } finally {
    loading.value = false
  }
}

// Kirim per item
function sendItem(index: number) {
  if (index >= queue.value.length) return
  
  const item = queue.value[index]
  const phone = formatPhone(item.noHp)
  
  // Format isi pesan dari template
  let msg = messageTemplate.value
    .replace(/{nama}/g, item.nama)
    .replace(/{nik}/g, item.nik)
    .replace(/{rt}/g, item.rt)

  // Buka WhatsApp Web/App
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  window.open(waUrl, '_blank')

  // Set status terkirim
  queue.value[index].status = 'sent'
  
  // Geser indeks aktif ke berikutnya secara otomatis
  if (index === activeIndex.value && index + 1 < queue.value.length) {
    activeIndex.value = index + 1
  }
}

function resetQueue() {
  queue.value = []
  activeIndex.value = null
}
</script>
