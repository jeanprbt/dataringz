<template>
    <PageModal :title="sportData.name" :show="showSportPage" @close="closePage">
        <div v-if="isLoading" class="flex justify-center items-center h-48">
            <span class="mr-3">Loading sport data</span>
            <UIcon name="i-svg-spinners-ring-resize" class="h-6 w-6 text-primary" />
        </div>
        <div v-else class="sport-content">
            <div class="flex items-center mb-4">
                <div class="sport-icon mr-3">
                    <SportPicture :name="sportData.name" :slug="sportData.slug" size="lg" />
                </div>
                <div>
                    <h3 class="text-xl font-medium">{{ sportData.name }}</h3>
                    <div v-if="sportData.description" class="text-sm text-gray-600 dark:text-gray-400">
                        {{ sportData.description }}
                    </div>
                </div>
            </div>

            <!-- Events for this sport -->
            <div v-if="hasEvents" class="mt-6">
                <div class="flex items-center mb-2">
                    <h3 class="text-lg font-medium">Events</h3>
                    <ShowMoreButton v-if="sportData.events.length > 5" :showing-all="showAllEvents"
                        :total="sportData.events.length" @toggle="showAllEvents = !showAllEvents" />
                </div>
                <div class="bg-white shadow dark:bg-gray-800 rounded-lg p-4">
                    <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        <li v-for="(event, index) in displayedEvents" :key="index">
                            {{ event }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Top Athletes with medals -->
            <div v-if="hasAthletes" class="mt-6">
                <div class="flex items-center mb-3">
                    <h3 class="text-lg font-medium">Top Athletes</h3>
                    <ShowMoreButton v-if="sportData.athletes.length > 8" :showing-all="showAllAthletes"
                        :total="sportData.athletes.length" @toggle="showAllAthletes = !showAllAthletes" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <NuxtLink v-for="athlete in displayedAthletes" :key="athlete.slug"
                        :to="`/athlete/${athlete.slug}`"
                        class="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                        <AthletePicture :name="athlete.name" :slug="athlete.slug" size="sm" class="mb-2" />
                        <span class="text-center text-sm font-medium">{{ athlete.name }}</span>
                        <div class="flex items-center mt-1">
                            <img v-if="athlete.countryCode" 
                                 :src="`/img/flags/${athlete.countryCode.toLowerCase()}.svg`"
                                 :alt="`Flag of ${athlete.country}`"
                                 class="h-3 w-4 mr-1 object-cover"
                            />
                            <span class="text-xs text-gray-600 dark:text-gray-400">{{ athlete.country }}</span>
                        </div>
                        <MedalDisplay v-if="athlete.medals" :medals="athlete.medals" class="mt-2" />
                    </NuxtLink>
                </div>
            </div>

            <!-- Top Countries with medals -->
            <div v-if="hasCountries" class="mt-6">
                <div class="flex items-center mb-3">
                    <h3 class="text-lg font-medium">Medal-Winning Countries</h3>
                    <ShowMoreButton v-if="sportData.countries.length > 8" :showing-all="showAllCountries"
                        :total="sportData.countries.length" @toggle="showAllCountries = !showAllCountries" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <NuxtLink v-for="country in displayedCountries" :key="country.slug"
                        :to="`/country/${country.slug}`"
                        class="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                        <img v-if="country.code" 
                             :src="`/img/flags/${country.code.toLowerCase()}.svg`"
                             :alt="`Flag of ${country.name}`"
                             class="w-10 h-6 rounded object-cover border border-gray-200 dark:border-gray-700 mb-2" 
                        />
                        <span class="text-center text-sm font-medium">{{ country.name }}</span>
                        <MedalDisplay v-if="country.medals" :medals="country.medals" class="mt-2" />
                    </NuxtLink>
                </div>
            </div>

            <!-- Venues for this sport -->
            <div v-if="hasVenues" class="mt-6">
                <h3 class="text-lg font-medium mb-3">Venues</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <NuxtLink 
                        v-for="venue in sportData.venues" 
                        :key="venue.slug" 
                        :to="`/venue/${venue.slug}`"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                        <UIcon name="i-heroicons-map-pin" class="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span class="text-sm font-medium">{{ venue.name }}</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import type { SportData, SportsDataMap } from '~/types/olympics';
import { sortByMedals } from '~/utils/medals';

// State management
const router = useRouter();
const route = useRoute();
const showSportPage = ref(true);
const slug = route.params.slug as string;
const isLoading = ref(true);
const sportsData = ref<SportsDataMap>({});

// UI state
const showAllEvents = ref(false);
const showAllAthletes = ref(false);
const showAllCountries = ref(false);

// Load data on component mount
onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await fetch('/data/sports.json');
        sportsData.value = await response.json();
    } catch (error) {
        console.error('Failed to load sports data:', error);
    } finally {
        isLoading.value = false;
    }
});

// Get sport data based on the slug
const sportData = computed<SportData>(() => {
    // First check if data is available in the loaded JSON
    if (sportsData.value && sportsData.value[slug]) {
        return sportsData.value[slug];
    }

    // Fallback to empty data
    return {
        name: 'Unknown Sport',
        slug: slug,
        events: [],
        athletes: [],
        countries: [],
        venues: []
    };
});

// SEO metadata using Nuxt's useHead
useHead(() => {
    const sportName = sportData.value.name;
    const eventCount = sportData.value.events?.length || 0;
    const athleteCount = sportData.value.athletes?.length || 0;
    
    const title = `${sportName} - Paris 2024 Olympic Games`;
    const description = `Explore ${sportName} at the Paris 2024 Olympic Games. ${eventCount} events with ${athleteCount} top athletes competing for Olympic medals.`;
    
    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.com/sport/${slug}` },
            { property: 'og:type', content: 'website' },
            
            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

// Check if we have data for various sections
const hasEvents = computed(() => sportData.value.events?.length > 0);
const hasAthletes = computed(() => sportData.value.athletes?.length > 0);
const hasCountries = computed(() => sportData.value.countries?.length > 0);
const hasVenues = computed(() => sportData.value.venues?.length > 0);

// Computed properties for displayed items
const displayedEvents = computed(() => {
    return showAllEvents.value ? sportData.value.events : sportData.value.events.slice(0, 4);
});

const displayedAthletes = computed(() => {
    return showAllAthletes.value
        ? sortByMedals(sportData.value.athletes)
        : sortByMedals(sportData.value.athletes).slice(0, 4);
});

const displayedCountries = computed(() => {
    return showAllCountries.value
        ? sortByMedals(sportData.value.countries)
        : sortByMedals(sportData.value.countries).slice(0, 4);
});

function closePage() {
    showSportPage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>