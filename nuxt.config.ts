export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  ui: {
      fonts: false,
  },

  runtimeConfig: {
      public: {
          MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
          INTRO: process.argv.includes('--intro'),
      },
  },

  devtools: { enabled: true },

  app: {
      head: {
          title: 'DataRingz - Paris 2024 Olympic Games Visualization',
          titleTemplate: '%s | DataRingz',
          meta: [
              { name: 'description', content: 'Interactive data visualization for the Paris 2024 Olympic Games, exploring athlete performances and competition data.' },
              { name: 'viewport', content: 'width=device-width, initial-scale=1' },
              { property: 'og:title', content: 'DataRingz - Paris 2024 Olympic Games' },
              { property: 'og:description', content: 'Interactive data visualization for the Paris 2024 Olympic Games' },
              { property: 'og:type', content: 'website' },
              { name: 'twitter:card', content: 'summary_large_image' },
              { name: 'twitter:title', content: 'DataRingz - Paris 2024 Olympic Games' },
              { name: 'twitter:description', content: 'Interactive data visualization for the Paris 2024 Olympic Games' },
          ],
          link: [
              { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
              { rel: 'canonical', href: 'https://dataringz.martinctl.dev' }
          ],
      }
  },

  nitro: {
    routeRules: {
      '/storage/**': { cors: true }
    }
  },

  compatibilityDate: '2025-04-28',
});