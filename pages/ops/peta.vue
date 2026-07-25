<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login di /ops</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Peta RT</h1>
      <p class="text-sm muted mt-1">
        Titik KK ber-koordinat (atau centroid RT fallback). Klik marker untuk detail.
      </p>

      <div class="card p-3 mt-5 overflow-hidden">
        <div ref="mapEl" class="w-full h-[420px] rounded-lg" style="background: #0b1210" />
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div v-for="p in points.filter((x) => x.isCentroid)" :key="p.id" class="card p-3 text-sm">
          <div class="font-semibold">RT {{ p.rt }}</div>
          <div class="muted text-xs">{{ p.jiwa || 0 }} jiwa (centroid)</div>
        </div>
      </div>
      <p v-if="!hasCoords" class="text-xs muted mt-3">
        Belum ada lat/lng di data KK — menampilkan titik tengah RT. Isi lat/lng di form KK untuk peta akurat.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Peta' })
const auth = useAuthStore()
const mapEl = ref<HTMLElement | null>(null)
const points = ref<any[]>([])
const hasCoords = ref(false)
let map: any
let L: any

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')

  const res = await $fetch<any>('/api/map')
  points.value = res.points || []
  hasCoords.value = !!res.hasCoords

  if (!import.meta.client || !mapEl.value) return
  // Leaflet via CDN to avoid extra dep
  if (!(window as any).L) {
    await new Promise<void>((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('leaflet'))
      document.head.appendChild(s)
    })
  }
  L = (window as any).L
  map = L.map(mapEl.value).setView([-7.7956, 110.3695], 15)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    maxZoom: 19,
  }).addTo(map)

  const bounds: any[] = []
  for (const p of points.value) {
    if (p.lat == null || p.lng == null) continue
    const m = L.circleMarker([p.lat, p.lng], {
      radius: p.isCentroid ? 10 : 6,
      color: '#34d399',
      fillColor: '#0d3b2e',
      fillOpacity: 0.85,
      weight: 2,
    }).addTo(map)
    m.bindPopup(
      `<strong>${p.kepala || p.nomorKk}</strong><br/>RT ${p.rt}/RW ${p.rw}<br/>${p.alamat || ''}${
        p.jiwa != null ? `<br/>${p.jiwa} jiwa` : ''
      }`,
    )
    bounds.push([p.lat, p.lng])
  }
  if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 })
})
</script>
