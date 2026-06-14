export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },

  // === 目录映射 ===
  srcDir: 'app/',
  serverDir: 'engine/',

  dir: {
    pages: 'pages',
    layouts: 'layouts',
    components: 'components',
    middleware: 'middleware',
    public: '../public',
    assets: 'assets',
  },

  imports: {
    dirs: ['lib'],
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      routes: ['/', '/archive', '/links'],
      crawlLinks: false,
    },
    routeRules: {
      '/': {
        headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
      },
      '/archive': {
        headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
      },
      '/links': {
        headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
      },
      '/api/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
  },
})
