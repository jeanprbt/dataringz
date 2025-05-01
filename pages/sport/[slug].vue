<template>
    <PageModal :show="showSportPage" :back="canGoBack" :transition="canGoBack" :items="items" @close="closePage"
        @back="router.back()">
        <div class="sport-content">
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
import sports from '~/data/sports.json';

definePageMeta({
    middleware: ['sport', 'previous', 'breadcrumb'],
    layout: 'map'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('sport').value;
const showSportPage = ref(!directAccess);

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const sport = sports[slug as keyof typeof sports];

// UI STATE ------------------------
const showAllEvents = ref(false);
const showAllAthletes = ref(false);
const showAllCountries = ref(false);


// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showSportPage.value = true, 4200);
    }
});

useHead(() => {
    const sportName = sport.name;
    const eventCount = sport.events?.length || 0;
    const athleteCount = sport.athletes?.length || 0;

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
const canGoBack = computed(() => previous.value && previous.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showSportPage.value = false;
    router.push('/');
}

// COMPUTED VALUES -----------------------------------------------------------------------------------------------------
const hasEvents = computed(() => sport.events?.length > 0);
const hasAthletes = computed(() => sport.athletes?.length > 0);
const hasCountries = computed(() => sport.countries?.length > 0);
const hasVenues = computed(() => sport.venues?.length > 0);
const displayedEvents = computed(() => {
    return showAllEvents.value ? sport.events : sport.events.slice(0, 4);
});
const displayedAthletes = computed(() => {
    return showAllAthletes.value
        ? sortByMedals(sport.athletes)
        : sortByMedals(sport.athletes).slice(0, 4);
});
const displayedCountries = computed(() => {
    return showAllCountries.value
        ? sortByMedals(sport.countries)
        : sortByMedals(sport.countries).slice(0, 4);
});
</script>