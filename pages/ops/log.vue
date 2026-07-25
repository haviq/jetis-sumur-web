<template>
  <div>
    <div v-if="!auth.user || !auth.isAdmin" class="muted">Hanya admin</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Audit log</h1>
      <p class="text-sm muted mt-1">Aktivitas sistem — tampilan manusiawi + raw.</p>
      <div class="card mt-6 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left muted border-b" style="border-color: var(--border)">
              <th class="p-3">Waktu</th>
              <th class="p-3">User</th>
              <th class="p-3">Aktivitas</th>
              <th class="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in items" :key="l.id" class="border-b" style="border-color: var(--border)">
              <td class="p-3 whitespace-nowrap text-xs muted">{{ formatWhen(l.waktu) }}</td>
              <td class="p-3 font-medium">{{ l.user }}</td>
              <td class="p-3">
                <div>{{ l.human || l.aktivitas }}</div>
                <div v-if="l.human && l.human !== l.aktivitas" class="text-[11px] muted font-mono mt-0.5">
                  {{ l.aktivitas }}
                </div>
              </td>
              <td class="p-3 muted text-xs">{{ l.ip || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Log' })
const auth = useAuthStore()
const items = ref<any[]>([])

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  } catch {
    return iso
  }
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  const res = await $fetch<any>('/api/logs')
  items.value = res.items || []
})
</script>
