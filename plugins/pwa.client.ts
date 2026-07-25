export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
})
