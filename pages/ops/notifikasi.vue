<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Notifikasi</h1>
      <p class="text-sm muted mt-1">Push browser & WhatsApp — kirim pengumuman ke semua perangkat terdaftar.</p>

      <!-- Status bar -->
      <div class="flex flex-wrap gap-3 mt-4">
        <div class="card px-4 py-2 flex items-center gap-2 text-sm">
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="vapidOk ? 'bg-emerald-500' : 'bg-red-400'"
          />
          <span>VAPID {{ vapidOk ? 'terkonfigurasi' : 'belum dikonfigurasi' }}</span>
        </div>
        <div class="card px-4 py-2 flex items-center gap-2 text-sm">
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="pushStatus === 'subscribed' ? 'bg-emerald-500' : pushStatus === 'denied' ? 'bg-red-400' : 'bg-yellow-400'"
          />
          <span>Browser: {{ pushStatusLabel }}</span>
        </div>
        <div class="card px-4 py-2 flex items-center gap-2 text-sm">
          <span class="muted">Subscribers:</span>
          <span class="font-semibold">{{ subscriberCount }}</span>
        </div>
      </div>

      <div class="grid gap-6 mt-6 lg:grid-cols-2">
        <!-- ── Kolom kiri: push browser ────────────────────────────── -->
        <div class="space-y-4">
          <!-- Subscribe toggle -->
          <div class="card p-4">
            <h2 class="font-semibold mb-1">Push Notifikasi Browser</h2>
            <p class="text-sm muted mb-3">
              Aktifkan notifikasi di perangkat ini agar menerima push saat ada pengumuman baru.
            </p>
            <div class="flex gap-2">
              <button
                v-if="pushStatus !== 'subscribed'"
                class="btn btn-primary text-sm"
                :disabled="pushStatus === 'denied' || swBusy"
                type="button"
                @click="subscribe"
              >
                {{ swBusy ? 'Memproses…' : pushStatus === 'denied' ? 'Notifikasi diblokir' : 'Aktifkan Notifikasi' }}
              </button>
              <button
                v-else
                class="btn btn-ghost text-sm"
                :disabled="swBusy"
                type="button"
                @click="unsubscribe"
              >
                {{ swBusy ? 'Memproses…' : 'Nonaktifkan' }}
              </button>
              <button
                v-if="pushStatus === 'denied'"
                class="btn btn-ghost text-sm"
                type="button"
                @click="openBrowserSettings"
              >
                Buka Pengaturan Browser
              </button>
            </div>
            <p v-if="swError" class="text-red-500 text-xs mt-2">{{ swError }}</p>
          </div>

          <!-- Kirim push baru (admin only) -->
          <div v-if="auth.isAdmin" class="card p-4">
            <h2 class="font-semibold mb-3">Kirim Push Notifikasi</h2>
            <form class="space-y-3" @submit.prevent="sendPush">
              <div>
                <label class="block text-sm muted mb-1">Judul <span class="text-red-400">*</span></label>
                <input
                  v-model="form.title"
                  class="w-full border rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style="border-color: var(--border)"
                  placeholder="Pengumuman Rapat RT"
                  required
                  type="text"
                />
              </div>
              <div>
                <label class="block text-sm muted mb-1">Pesan</label>
                <textarea
                  v-model="form.body"
                  class="w-full border rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  style="border-color: var(--border)"
                  placeholder="Detail pengumuman…"
                  rows="3"
                />
              </div>
              <div>
                <label class="block text-sm muted mb-1">URL tujuan</label>
                <input
                  v-model="form.url"
                  class="w-full border rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style="border-color: var(--border)"
                  placeholder="/ops"
                  type="text"
                />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <button
                  class="btn btn-primary text-sm"
                  :disabled="sendBusy || !form.title"
                  type="submit"
                >
                  {{ sendBusy ? 'Mengirim…' : 'Kirim Push' }}
                </button>
                <span v-if="sendResult" class="text-sm" :class="sendResult.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                  {{ sendResult.ok ? `✓ Terkirim ke ${sendResult.sent} perangkat` : `✗ ${sendResult.error}` }}
                </span>
              </div>
            </form>
          </div>
        </div>

        <!-- ── Kolom kanan: WhatsApp ───────────────────────────────── -->
        <div class="space-y-4">
          <div class="card p-4">
            <h2 class="font-semibold mb-1">Kirim via WhatsApp</h2>
            <p class="text-sm muted mb-3">
              Buka wa.me deeplink untuk kirim pesan ke nomor WhatsApp yang dikonfigurasi di tenant.
            </p>
            <form class="space-y-3" @submit.prevent="sendWa">
              <div>
                <label class="block text-sm muted mb-1">Pesan WA</label>
                <textarea
                  v-model="waForm.message"
                  class="w-full border rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  style="border-color: var(--border)"
                  placeholder="Pesan notifikasi WhatsApp…"
                  rows="3"
                />
              </div>
              <div>
                <label class="block text-sm muted mb-1">Nomor tujuan (opsional)</label>
                <input
                  v-model="waForm.to"
                  class="w-full border rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style="border-color: var(--border)"
                  placeholder="08123456789 (kosong = default tenant)"
                  type="text"
                />
              </div>
              <div class="flex items-center gap-2 pt-1">
                <button class="btn btn-primary text-sm" :disabled="waBusy" type="submit">
                  {{ waBusy ? 'Membuka…' : 'Buka WA' }}
                </button>
                <span v-if="waError" class="text-red-500 text-sm">{{ waError }}</span>
              </div>
            </form>
          </div>

          <!-- Panduan cepat -->
          <div class="card p-4 text-sm space-y-2">
            <h2 class="font-semibold">Panduan</h2>
            <ul class="space-y-1 muted list-disc list-inside">
              <li>Set <code class="font-mono text-xs">VAPID_PUBLIC_KEY</code> dan <code class="font-mono text-xs">VAPID_PRIVATE_KEY</code> di env.</li>
              <li>Generate key: <code class="font-mono text-xs">npx web-push generate-vapid-keys</code></li>
              <li>Setiap perangkat yang klik "Aktifkan" akan terdaftar sebagai subscriber.</li>
              <li>Kirim Push menyebar ke semua subscriber aktif sekaligus.</li>
              <li>Subscription hilang saat server restart (in-memory MVP).</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ── Riwayat notifikasi ──────────────────────────────────────── -->
      <div class="mt-8">
        <h2 class="font-semibold mb-3">Riwayat Notifikasi</h2>
        <div class="card overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left muted border-b" style="border-color: var(--border)">
                <th class="p-3">Waktu</th>
                <th class="p-3">Judul</th>
                <th class="p-3">Pesan</th>
                <th class="p-3">URL</th>
                <th class="p-3 text-right">Terkirim</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="n in history"
                :key="n.id"
                class="border-b"
                style="border-color: var(--border)"
              >
                <td class="p-3 text-xs muted whitespace-nowrap">{{ formatWhen(n.sentAt) }}</td>
                <td class="p-3 font-medium">{{ n.title }}</td>
                <td class="p-3 muted max-w-[200px] truncate">{{ n.body || '—' }}</td>
                <td class="p-3 font-mono text-xs muted">{{ n.url || '/ops' }}</td>
                <td class="p-3 text-right">
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ n.sent }}</span>
                  <span class="muted"> / {{ n.total }}</span>
                </td>
              </tr>
              <tr v-if="!history.length">
                <td colspan="5" class="p-6 text-center muted">Belum ada notifikasi dikirim</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Notifikasi' })

const auth = useAuthStore()

// ── State ────────────────────────────────────────────────────────────────────
const vapidOk = ref(false)
const subscriberCount = ref(0)
const pushStatus = ref<'default' | 'granted' | 'denied' | 'subscribed' | 'unsupported'>('default')
const swBusy = ref(false)
const swError = ref('')
const sendBusy = ref(false)
const waBusy = ref(false)
const waError = ref('')
const history = ref<any[]>([])

const form = reactive({ title: '', body: '', url: '/ops' })
const waForm = reactive({ message: '', to: '' })
const sendResult = ref<{ ok: boolean; sent?: number; error?: string } | null>(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const pushStatusLabel = computed(() => {
  const map: Record<string, string> = {
    subscribed: 'Terdaftar',
    granted: 'Diizinkan (belum daftar)',
    denied: 'Diblokir',
    default: 'Belum diizinkan',
    unsupported: 'Tidak didukung',
  }
  return map[pushStatus.value] ?? pushStatus.value
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  } catch {
    return iso
  }
}

function openBrowserSettings() {
  // Chrome / Edge: chrome://settings/content/notifications — can't navigate directly,
  // just show a hint by pointing to the lock icon in the address bar
  alert('Klik ikon kunci/info di address bar browser, lalu ubah izin Notifikasi menjadi "Izinkan".')
}

// ── Service Worker & Push ─────────────────────────────────────────────────────
async function detectPushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    pushStatus.value = 'unsupported'
    return
  }
  const perm = Notification.permission
  if (perm === 'denied') { pushStatus.value = 'denied'; return }

  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (reg) {
      const sub = await reg.pushManager.getSubscription()
      pushStatus.value = sub ? 'subscribed' : perm === 'granted' ? 'granted' : 'default'
    } else {
      pushStatus.value = perm === 'granted' ? 'granted' : 'default'
    }
  } catch {
    pushStatus.value = 'default'
  }
}

async function subscribe() {
  swBusy.value = true
  swError.value = ''
  try {
    if (!('serviceWorker' in navigator)) throw new Error('Service Worker tidak didukung browser ini')

    // Minta izin notifikasi
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      pushStatus.value = 'denied'
      throw new Error('Izin notifikasi ditolak')
    }

    // Daftar service worker
    let reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!reg) reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready

    // Ambil VAPID public key dari server
    const config = await $fetch<{ vapidPublicKey?: string }>('/api/push/config').catch(() => ({ vapidPublicKey: '' }))
    if (!config.vapidPublicKey) throw new Error('VAPID public key belum dikonfigurasi di server')

    // Subscribe ke push manager
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
    })

    // Kirim subscription ke server
    await $fetch('/api/push/subscribe', {
      method: 'POST',
      body: { subscription: sub.toJSON() },
    })

    pushStatus.value = 'subscribed'
    await loadStats()
  } catch (e: any) {
    swError.value = e?.message ?? String(e)
  } finally {
    swBusy.value = false
  }
}

async function unsubscribe() {
  swBusy.value = true
  swError.value = ''
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (reg) {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        // Beritahu server untuk hapus subscription ini
        await $fetch('/api/push/subscribe', {
          method: 'POST',
          body: { action: 'unsubscribe', subscription: sub.toJSON() },
        }).catch(() => {})
        await sub.unsubscribe()
      }
    }
    pushStatus.value = 'default'
    await loadStats()
  } catch (e: any) {
    swError.value = e?.message ?? String(e)
  } finally {
    swBusy.value = false
  }
}

// Konversi VAPID public key dari base64url ke Uint8Array untuk pushManager.subscribe
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0))
}

// ── Send push ─────────────────────────────────────────────────────────────────
async function sendPush() {
  if (!form.title.trim()) return
  sendBusy.value = true
  sendResult.value = null
  try {
    const res = await $fetch<{ ok: boolean; sent: number; total: number; expiredRemoved: number }>(
      '/api/push/send',
      { method: 'POST', body: { title: form.title, body: form.body, url: form.url || '/ops' } }
    )
    sendResult.value = { ok: true, sent: res.sent }
    form.title = ''
    form.body = ''
    form.url = '/ops'
    await loadHistory()
  } catch (e: any) {
    sendResult.value = { ok: false, error: e?.data?.statusMessage ?? e?.message ?? 'Gagal mengirim' }
  } finally {
    sendBusy.value = false
    setTimeout(() => { sendResult.value = null }, 5000)
  }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
async function sendWa() {
  waBusy.value = true
  waError.value = ''
  try {
    const res = await $fetch<{ ok: boolean; url?: string; statusMessage?: string }>('/api/wa', {
      method: 'POST',
      body: {
        message: waForm.message || undefined,
        to: waForm.to || undefined,
        kind: 'notifikasi',
      },
    })
    if (res.ok && res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    } else {
      waError.value = res.statusMessage ?? 'Nomor WA belum dikonfigurasi'
    }
  } catch (e: any) {
    waError.value = e?.data?.statusMessage ?? e?.message ?? 'Gagal membuka WA'
  } finally {
    waBusy.value = false
  }
}

// ── Data loaders ──────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await $fetch<{ vapidConfigured: boolean; subscribers: number }>('/api/push/config')
    vapidOk.value = res.vapidConfigured
    subscriberCount.value = res.subscribers
  } catch {
    vapidOk.value = false
  }
}

async function loadHistory() {
  try {
    const res = await $fetch<{ items: any[] }>('/api/push/history')
    history.value = res.items ?? []
  } catch {
    history.value = []
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  await Promise.all([loadStats(), loadHistory(), detectPushStatus()])
})
</script>
