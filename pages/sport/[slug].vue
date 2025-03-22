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
                    <h3 class="text-xl font-medium text-zinc-800 dark:text-white">{{ sportData.name }}</h3>
                    <div v-if="sportData.description" class="text-sm text-zinc-600 dark:text-gray-300">
                        {{ sportData.description }}
                    </div>
                </div>
            </div>

            <!-- Events for this sport -->
            <div v-if="hasEvents" class="mt-6">
                <div class="flex items-center mb-2">
                    <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Events</h3>
                    <ShowMoreButton v-if="sportData.events.length > 5" :showing-all="showAllEvents"
                        :total="sportData.events.length" @toggle="showAllEvents = !showAllEvents" />
                </div>
                <div class="bg-white dark:bg-zinc-700 rounded-lg shadow border border-zinc-200 dark:border-zinc-600 p-4">
                    <ul class="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-200">
                        <li v-for="(event, index) in displayedEvents" :key="index">
                            {{ event }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Top Athletes with medals -->
            <div v-if="hasAthletes" class="mt-6">
                <div class="flex items-center mb-3">
                    <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Top Athletes</h3>
                    <ShowMoreButton v-if="sportData.athletes.length > 8" :showing-all="showAllAthletes"
                        :total="sportData.athletes.length" @toggle="showAllAthletes = !showAllAthletes" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <AthleteLink 
                        v-for="athlete in displayedAthletes" 
                        :key="athlete.slug" 
                        :slug="athlete.slug" 
                        :name="athlete.name" 
                        :country-name="athlete.country"
                        :country-code="athlete.countryCode">
                        <template #after v-if="athlete.medals">
                            <MedalDisplay :medals="athlete.medals" class="mt-2" />
                        </template>
                    </AthleteLink>
                </div>
            </div>

            <!-- Top Countries with medals -->
            <div v-if="hasCountries" class="mt-6">
                <div class="flex items-center mb-3">
                    <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Medal-Winning Countries</h3>
                    <ShowMoreButton v-if="sportData.countries.length > 8" :showing-all="showAllCountries"
                        :total="sportData.countries.length" @toggle="showAllCountries = !showAllCountries" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <CountryLink 
                        v-for="country in displayedCountries" 
                        :key="country.slug" 
                        :slug="country.slug" 
                        :name="country.name" 
                        :code="country.code">
                        <template #after v-if="country.medals">
                            <MedalDisplay :medals="country.medals" class="mt-2" />
                        </template>
                    </CountryLink>
                </div>
            </div>

            <!-- Venues for this sport -->
            <div v-if="hasVenues" class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-3">Venues</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <VenueLink 
                        v-for="venue in sportData.venues" 
                        :key="venue.slug" 
                        :slug="venue.slug" 
                        :name="venue.name" 
                    />
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
            { property: 'og:url', content: `https://dataringz.martinctl.dev/sport/${slug}` },
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