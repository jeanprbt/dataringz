<template>
    <!-- This page intentionally left empty as we want to show just the map on the home page -->
</template>

<script setup>
useHead({
    title: 'DataRingz - Paris 2024 Olympic Games Visualization',
    meta: [
        { 
            name: 'description', 
            content: 'Interactive data visualization dashboard for the Paris 2024 Olympic Games. Explore athletes, sports, venues, and medal counts in an engaging visual experience.'
        },
        // Open Graph
        { property: 'og:title', content: 'DataRingz - Paris 2024 Olympic Games Visualization' },
        { property: 'og:description', content: 'Interactive data visualization for the Paris 2024 Olympic Games. Explore athletes, sports, venues, and medal counts.' },
        { property: 'og:url', content: 'https://dataringz.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DataRingz' },
        
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'DataRingz - Paris 2024 Olympic Games Visualization' },
        { name: 'twitter:description', content: 'Interactive data visualization for the Paris 2024 Olympic Games' },
        
        // Additional SEO
        { name: 'keywords', content: 'Olympics, Paris 2024, Data Visualization, Olympic Games, Sports, Athletes, Medal Count' }
    ],
    link: [
        { rel: 'canonical', href: 'https://dataringz.com' }
    ]
});
</script>