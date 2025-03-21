<template>
    <PageModal :title="venueData.name" :show="showVenuePage" @close="closePage">
        <div class="venue-content p-3">
            <div v-if="isLoading" class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
            
            <div v-else class="max-w-3xl mx-auto">
                <!-- Venue image (if available) -->
                <div v-if="hasImage" class="mb-4 rounded-lg overflow-hidden aspect-video">
                    <img :src="`/img/venues/${venueData.slug}.jpg`" :alt="venueData.name" 
                         class="w-full h-full object-cover" />
                </div>
                
                <!-- Header with dates -->
                <div class="flex flex-col md:flex-row justify-between items-start gap-3 mb-5">
                    <div>
                        <h2 class="text-xl font-bold">{{ venueData.name }}</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ venueData.description }}</p>
                    </div>
                    
                    <!-- Dates badge -->
                    <div v-if="venueData.date_start && venueData.date_end" 
                         class="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                        {{ formatDateRange(venueData.date_start, venueData.date_end) }}
                    </div>
                </div>
                
                <!-- Sports grid (no heading) -->
                <div v-if="venueData.sports && venueData.sports.length > 0" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <NuxtLink 
                        v-for="sport in venueData.sports" 
                        :key="sport.slug" 
                        :to="`/sport/${sport.slug}`"
                        class="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                        <img :src="sport.icon" :alt="sport.name" class="w-10 h-10 mb-2" />
                        <span class="text-center text-sm font-medium">{{ sport.name }}</span>
                    </NuxtLink>
                </div>
                <p v-else class="text-gray-500 dark:text-gray-400 text-sm">No sports information available</p>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const showVenuePage = ref(true);
const isLoading = ref(true);
const hasImage = ref(false);

// Get the venue slug from the route
const slug = route.params.slug as string;

// Data refs
const venueData = ref<any>({ name: 'Loading...' });

// Available venue images (from your public/img/venues directory)
const availableImages = [
    'aquatics-centre',
    'bercy-arena',
    'champ-de-mars-arena',
    'chateau-de-versailles',
    'chateauroux-shooting-centre',
    'eiffel-tower-stadium',
    'elancourt-hill',
    'grand-palais',
    'hotel-de-ville',
    'invalides',
    'la-concorde',
    'le-bourget-climbing-venue',
    'le-golf-national',
    'north-paris-arena',
    'paris-la-defense-arena',
    'pierre-mauroy-stadium'
];

// Load venue data
onMounted(async () => {
    try {
        // Load both data sources
        const [venuesJson, venuesGeoJson] = await Promise.all([
            fetch('/data/venues.json').then(res => res.json()),
            fetch('/geojson/venues.geojson').then(res => res.json())
        ]);
        
        // Get venue data from venues.json
        const venue = venuesJson[slug];
        
        if (venue) {
            venueData.value = venue;
        } else {
            // Fallback to GeoJSON if not found in venues.json
            const geoFeature = venuesGeoJson.features.find((f: any) => f.properties?.slug === slug);
            if (geoFeature) {
                venueData.value = {
                    name: geoFeature.properties.name,
                    slug: geoFeature.properties.slug,
                    sports: [],
                    location: {
                        latitude: geoFeature.geometry.coordinates[1],
                        longitude: geoFeature.geometry.coordinates[0]
                    }
                };
            } else {
                venueData.value = { name: 'Unknown Venue' };
            }
        }
        
        // Check if we have an image for this venue
        hasImage.value = availableImages.includes(slug);
    } catch (error) {
        console.error('Error loading venue data:', error);
    } finally {
        isLoading.value = false;
    }
});

// Format date for display
const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

// Format date range for display
const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Dates not available';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same month, show as "July 28 - 31, 2024"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // If different months but same year, show as "July 28 - Aug 3, 2024"
    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // Otherwise show full dates
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Add SEO metadata
useHead(() => {
    const name = venueData.value.name;
    const sports = venueData.value.sports && venueData.value.sports.length > 0 
        ? venueData.value.sports.map((s: any) => s.name).join(', ')
        : 'Olympic sports';
    
    const title = `${name} - Olympic Venue | Paris 2024`;
    const description = `Explore ${name}, an Olympic venue for ${sports} at the Paris 2024 Olympic Games.`;
    
    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/venue/${slug}` },
            { property: 'og:type', content: 'website' },
            
            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

// Close the page and navigate back to the map
function closePage() {
    showVenuePage.value = false;
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>