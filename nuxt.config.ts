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
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
      ],
    },
  },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
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
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Tesla 交車檢查清單',
      short_name: '交車檢查',
      description: '特斯拉交車現場檢查清單，支援拍照、備註與 PDF 匯出。資料全程儲存在瀏覽器，不上傳。',
      theme_color: '#0F172A',
      background_color: '#F8FAFC',
      display: 'standalone',
      start_url: '/',
      lang: 'zh-Hant-TW',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,webp,ico}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
})
