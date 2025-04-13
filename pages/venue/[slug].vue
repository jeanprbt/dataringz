<template>
    <PageModal :show="showVenuePage" @close="closePage">
        <div class="venue-content p-3">
            <div v-if="isLoading" class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
            
            <div v-else class="max-w-3xl mx-auto">
                <!-- Venue image (if available) -->
                <div v-if="hasImage" class="mb-4 rounded-lg overflow-hidden aspect-video shadow-lg border border-zinc-400 dark:border-zinc-600">
                    <img :src="`/img/venues/${venue.slug}.jpg`" :alt="venue.name" 
                         class="w-full h-full object-cover" />
                </div>
                
                <!-- Header with dates -->
                <div class="flex flex-col md:flex-row justify-between items-start gap-3 mb-5">
                    <div>
                        <h2 class="text-xl font-bold text-zinc-800 dark:text-white">{{ venue.name }}</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ venue.description }}</p>
                    </div>
                    
                    <!-- Dates badge -->
                    <div v-if="venue.date_start && venue.date_end" 
                         class="bg-primary bg-opacity-10 text-zinc-800 dark:text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                        {{ formatDateRange(venue.date_start, venue.date_end) }}
                    </div>
                </div>
                
                <!-- Sports grid (no heading) -->
                <div v-if="venue.sports && venue.sports.length > 0" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <SportLink 
                        v-for="sport in venue.sports" 
                        :key="sport.slug" 
                        :slug="sport.slug"
                        :name="sport.name">
                        <template #icon>
                            <img :src="sport.icon" :alt="sport.name" class="w-10 h-10 mb-2 dark:filter dark:invert dark:brightness-90" />
                        </template>
                    </SportLink>
                </div>
                <p v-else class="text-gray-500 dark:text-gray-400 text-sm">No sports information available</p>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import { formatDateRange } from '~/utils/date';

// HANDLE DIRECT URL ---------------
definePageMeta({
    middleware: 'venue'
});
let directAccess = !!useState('venue').value;
const showVenuePage = ref(!directAccess);

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const venue = ref<any>({ name: 'Loading...' });

// UI STATE ------------------------
const isLoading = ref(true);
const hasImage = ref(false);

onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showVenuePage.value = true, 4200);
    }
    try {
        const json = await fetch('/data/venues.json').then(res => res.json());
        venue.value = json[slug];
        hasImage.value = availableImages.includes(slug);
    } catch (error) {
        console.error('Error loading venue data:', error);
    } finally {
        isLoading.value = false;
    }
});

useHead(() => {
    const name = venue.value.name;
    const sports = venue.value.sports && venue.value.sports.length > 0 
        ? venue.value.sports.map((s: any) => s.name).join(', ')
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


const closePage = () => {
    showVenuePage.value = false;
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>