export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  ssr: true,
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0F172A' },
      ],
    },
  },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'github_pages',
  },
  typescript: {
    strict: true,
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
  },
})
