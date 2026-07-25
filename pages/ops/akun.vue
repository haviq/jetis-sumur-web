<template>
  <div>
    <div v-if="!auth.isSuper" class="muted">Hanya super admin</div>
    <div v-else>
      <div class="flex items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-bold">Pengguna</h1>
          <p class="text-sm muted">Kelola akun dashboard</p>
        </div>
        <button class="btn btn-primary text-sm" type="button" @click="open()">+ Akun</button>
      </div>

      <div class="card mt-4 overflow-hidden">
        <div class="table-wrap">
          <table class="data">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Login terakhir</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in items" :key="a.id">
                <td>{{ a.nama }}</td>
                <td>{{ a.username }}</td>
                <td>{{ a.role }}</td>
                <td>{{ a.status }}</td>
                <td class="text-xs muted">{{ a.lastLogin || '—' }}</td>
                <td>
                  <button class="text-xs" style="color: var(--accent)" type="button" @click="open(a)">Ubah</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,.55)">
        <form class="card w-full max-w-md p-5 space-y-3" @submit.prevent="save">
          <h2 class="font-semibold">{{ form.id ? 'Ubah akun' : 'Akun baru' }}</h2>
          <div>
            <label class="label">Nama</label>
            <input v-model="form.nama" class="input" required />
          </div>
          <div>
            <label class="label">Username</label>
            <input v-model="form.username" class="input" required />
          </div>
          <div>
            <label class="label">Password {{ form.id ? '(kosongkan = tidak diubah)' : '' }}</label>
            <input v-model="form.password" type="password" class="input" :required="!form.id" />
          </div>
          <div>
            <label class="label">Role</label>
            <select v-model="form.role" class="input">
              <option value="padukuhan">padukuhan</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="form.status" class="input">
              <option value="aktif">aktif</option>
              <option value="nonaktif">nonaktif</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" @click="show = false">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ops' })
useHead({ title: 'Ops · Akun' })
const auth = useAuthStore()
const items = ref<any[]>([])
const show = ref(false)
const form = reactive({
  id: '',
  nama: '',
  username: '',
  password: '',
  role: 'padukuhan',
  status: 'aktif',
})

async function load() {
  const res = await $fetch<{ ok: boolean; items: any[] }>('/api/akun')
  items.value = res.items || []
}

function open(a?: any) {
  form.id = a?.id || ''
  form.nama = a?.nama || ''
  form.username = a?.username || ''
  form.password = ''
  form.role = a?.role || 'padukuhan'
  form.status = a?.status || 'aktif'
  show.value = true
}

async function save() {
  await $fetch('/api/akun', {
    method: 'POST',
    body: {
      id: form.id || undefined,
      nama: form.nama,
      username: form.username,
      password: form.password || undefined,
      role: form.role,
      status: form.status,
    },
  })
  show.value = false
  await load()
}

onMounted(async () => {
  if (!auth.loaded) await auth.fetchSession()
  if (!auth.user) return navigateTo('/ops')
  if (!auth.isSuper) return
  await load()
})
</script>
