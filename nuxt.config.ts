export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
      public: {
          MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
          INTRO: process.argv.includes('--intro'),
      },
  },

  modules: ['@nuxt/ui'],
});
