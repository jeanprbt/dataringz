export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss"],
    runtimeConfig: {
        public: {
            MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
            INTRO: process.argv.includes('--intro'),
        },
    },
});
