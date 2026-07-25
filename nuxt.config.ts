// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      titleTemplate: '%s · Jetis Sumur',
      title: 'Data Warga Jetis Sumur',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Sistem Informasi Pendataan Warga Padukuhan Jetis Sumur — statistik publik & dashboard pengelola.',
        },
        { name: 'theme-color', content: '#070c0a' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:wght@600;700&display=swap',
        },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET || process.env.ADMIN_PIN || 'jetis-sumur-dev-secret',
    adminPin: process.env.ADMIN_PIN || '',
    sheetsSpreadsheetId: process.env.SHEETS_SPREADSHEET_ID || '',
    googleSaEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    googleSaPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '',
      tenantId: process.env.NUXT_PUBLIC_TENANT_ID || process.env.TENANT_ID || 'jetis-sumur',
    },
  },
  nitro: {
    preset: 'vercel',
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
