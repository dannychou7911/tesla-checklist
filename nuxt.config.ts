import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_URL } from './utils/site-meta'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  ssr: true,
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: SITE_LOCALE },
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
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],
  css: ['~/assets/css/main.css'],
  site: {
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    defaultLocale: SITE_LOCALE,
  },
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
      name: SITE_NAME,
      short_name: '交車檢查',
      description: SITE_DESCRIPTION,
      theme_color: '#0F172A',
      background_color: '#F8FAFC',
      display: 'standalone',
      start_url: '/',
      lang: SITE_LOCALE,
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
