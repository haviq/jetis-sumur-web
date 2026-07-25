<template>
  <div>
    <div v-if="!auth.user" class="muted">Silakan login</div>
    <div v-else-if="!auth.isAdmin" class="muted">Hanya admin/super admin</div>
    <div v-else>
      <h1 class="font-display text-2xl font-bold">Master Data</h1>
      <p class="text-sm muted mt-1">Agama, pendidikan, pekerjaan, RT, RW, status rumah</p>

      <div class="grid gap-4 mt-6">
        <div v-for="cat in cats" :key="cat" class="card p-4">
          <div class="font-semibold mb-2 capitalize">{{ cat.replace('_', ' ') }}</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="m in byCat(cat)" :key="m.id" class="badge">{{ m.nilai }}</span>
            <span v-if="!byCat(cat).length" class="text-sm muted">Kosong</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Master' })
const auth = useAuthStore()
const items = ref<any[]>([])
const cats = ['agama', 'pendidikan', 'pekerjaan', 'rt', 'rw', 'status_rumah']

function byCat(c: string) {
  return items.value.filter((i) => i.kategori === c)
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  if (!auth.isAdmin) return
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/master')
  items.value = res.items || []
})
</script>
