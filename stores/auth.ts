import { defineStore } from 'pinia'

export type SessionUser = {
  id: string
  nama: string
  username: string
  role: 'super_admin' | 'admin' | 'padukuhan'
  tenantId?: string
  rtScope?: string[]
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as SessionUser | null,
    loaded: false,
  }),
  getters: {
    isLoggedIn: (s) => Boolean(s.user),
    isAdmin: (s) => s.user?.role === 'admin' || s.user?.role === 'super_admin',
    isSuper: (s) => s.user?.role === 'super_admin',
  },
  actions: {
    async fetchSession() {
      try {
        const res = await $fetch<{ ok: boolean; user: SessionUser | null }>('/api/auth/session')
        this.user = res.user
      } catch {
        this.user = null
      } finally {
        this.loaded = true
      }
    },
    async login(username: string, password: string) {
      const res = await $fetch<{ ok: boolean; user: SessionUser }>('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      this.user = res.user
      this.loaded = true
      return res.user
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    },
  },
})
