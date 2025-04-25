<template>
    <PageModal :show="showSportPage" :back="canGoBack" @close="closePage" @back="router.back()">
        <div v-if="isLoading" class="flex justify-center items-center h-48">
            <span class="mr-3">Loading sport data</span>
            <UIcon name="i-svg-spinners-ring-resize" class="h-6 w-6 text-primary" />
        </div>
        <div v-else class="sport-content">
            <div class="flex items-center mb-4">
                <div class="sport-icon mr-3">
                    <SportPicture :name="sport.name" :slug="sport.slug" size="lg" />
                </div>
                <div>
                    <h3 class="text-xl font-medium text-zinc-800 dark:text-white">{{ sport.name }}</h3>
                    <div v-if="sport.description" class="text-sm text-zinc-600 dark:text-gray-300">
                        {{ sport.description }}
                    </div>
                </div>
            </div>

            <!-- Events for this sport -->
            <div v-if="hasEvents" class="mt-6">
                <div class="flex items-center mb-2">
                    <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Events</h3>
                    <ShowMoreButton v-if="sport.events.length > 5" :showing-all="showAllEvents"
                        :total="sport.events.length" @toggle="showAllEvents = !showAllEvents" />
                </div>
                <div
                    class="bg-white dark:bg-zinc-700 rounded-lg shadow border border-zinc-200 dark:border-zinc-600 p-4">
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
                    <ShowMoreButton v-if="sport.athletes.length > 8" :showing-all="showAllAthletes"
                        :total="sport.athletes.length" @toggle="showAllAthletes = !showAllAthletes" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <AthleteLink v-for="athlete in displayedAthletes" :key="athlete.slug" :slug="athlete.slug"
                        :name="athlete.name" :country-name="athlete.country" :country-code="athlete.countryCode">
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
                    <ShowMoreButton v-if="sport.countries.length > 8" :showing-all="showAllCountries"
                        :total="sport.countries.length" @toggle="showAllCountries = !showAllCountries" />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <CountryLink v-for="country in displayedCountries" :key="country.slug" :slug="country.slug"
                        :name="country.name" :code="country.code">
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
                    <VenueLink v-for="venue in sport.venues" :key="venue.slug" :slug="venue.slug" :name="venue.name" />
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import { type SportData } from '~/types/olympics';

definePageMeta({
    middleware: ['sport', 'previous']
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('sport').value;
const showSportPage = ref(!directAccess);

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const sport = ref<SportData>({
    name: 'Unknown Sport',
    slug: slug,
    events: [],
    athletes: [],
    countries: [],
    venues: []
});

// UI STATE ------------------------
const isLoading = ref(true);
const showAllEvents = ref(false);
const showAllAthletes = ref(false);
const showAllCountries = ref(false);

onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showSportPage.value = true, 4200);
    }
    try {
        const json = await fetch('/data/sports.json').then(res => res.json());
        sport.value = json[slug];
    } catch (error) {
        console.error('Failed to load sports data:', error);
    } finally {
        isLoading.value = false;
    }
});

useHead(() => {
    const sportName = sport.value.name;
    const eventCount = sport.value.events?.length || 0;
    const athleteCount = sport.value.athletes?.length || 0;

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

// HANDLE BACK BUTTON -----------------------------
const previous = useState('previous');
const canGoBack = computed(() => previous.value && previous.value !== '/') as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showSportPage.value = false;
    router.push('/');
}

// COMPUTED VALUES -----------------------------------------------------------------------------------------------------
const hasEvents = computed(() => sport.value.events?.length > 0);
const hasAthletes = computed(() => sport.value.athletes?.length > 0);
const hasCountries = computed(() => sport.value.countries?.length > 0);
const hasVenues = computed(() => sport.value.venues?.length > 0);
const displayedEvents = computed(() => {
    return showAllEvents.value ? sport.value.events : sport.value.events.slice(0, 4);
});
const displayedAthletes = computed(() => {
    return showAllAthletes.value
        ? sortByMedals(sport.value.athletes)
        : sortByMedals(sport.value.athletes).slice(0, 4);
});
const displayedCountries = computed(() => {
    return showAllCountries.value
        ? sortByMedals(sport.value.countries)
        : sortByMedals(sport.value.countries).slice(0, 4);
});
</script>