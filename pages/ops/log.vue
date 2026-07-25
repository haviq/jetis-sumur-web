<template>
  <div>
    <div v-if="!auth.isAdmin" class="muted">Hanya admin</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Audit Log</h1>
      <div class="card mt-4 overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in items" :key="l.id">
                <td class="text-xs muted whitespace-nowrap">{{ l.waktu }}</td>
                <td>{{ l.user }}</td>
                <td>{{ l.aktivitas }}</td>
              </tr>
              <tr v-if="!items.length"><td colspan="3" class="muted">Kosong</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Log' })
const auth = useAuthStore()
const items = ref<any[]>([])

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  if (!auth.isAdmin) return
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/logs')
  items.value = res.items || []
})
</script>
