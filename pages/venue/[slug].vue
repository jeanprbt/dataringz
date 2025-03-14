<template>
    <div v-if="showVenuePage" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" @click="closePage">
        <div class="bg-white/90 dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[90%] h-[90%] overflow-auto transform transition-all duration-300 ease-in-out" @click.stop>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ venueData.title }}</h2>
                <button @click="closePage" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="venue-content">
                <!-- Venue content will go here -->
                <p>Details about {{ venueData.title }}</p>
                <!-- You can add more content, images, etc. here -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const showVenuePage = ref(true);

// Venue data mapping - you can expand this or fetch from an API
const venueMapping = {
    'eiffel-tower': {
        title: 'Eiffel Tower',
        coordinates: [2.294694, 48.858093]
    },
    'grand-palais': {
        title: 'Grand Palais',
        coordinates: [2.312156, 48.866096]
    },
    'chateau-de-versailles': {
        title: 'Château de Versailles',
        coordinates: [2.120728, 48.804694]
    }
};

// Get venue data based on the slug
const slug = route.params.slug as string;
const venueData = computed(() => {
    return venueMapping[slug as keyof typeof venueMapping] || { title: 'Unknown Venue' };
});

// Close the page and navigate back to the map
function closePage() {
    showVenuePage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 100);
}
</script>