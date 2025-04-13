<template>
    <PageModal :show="showCountryPage" @close="closePage">
        <div class="country-content">
            <div class="flex items-center mb-4">
                <div v-if="country.code" class="country-flag mr-3">
                    <img :src="`/img/flags/${country.code.toLowerCase()}.svg`" :alt="`Flag of ${country.name}`"
                        class="w-12 h-8 rounded object-cover" />
                </div>
                <h3 class="text-xl font-medium text-zinc-800 dark:text-white">{{ country.name }}</h3>
            </div>

            <p v-if="country.description" class="mb-4 text-zinc-700 dark:text-zinc-300">{{ country.description
                }}</p>

            <!-- Athletes from this country -->
            <div class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2">Athletes:</h3>
                <div class="space-y-2">
                    <AthleteLink v-for="athlete in country.athletes" :key="athlete.slug" :slug="athlete.slug"
                        :name="athlete.name" :countryName="country.name" :is-inline="true" />
                </div>
            </div>

            <!-- Sports this country competes in -->
            <div class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2">Sports:</h3>
                <div class="space-y-2">
                    <SportLink v-for="sport in country.sports" :key="sport.slug" :slug="sport.slug"
                        :name="sport.name" :description="sport.description" :is-inline="true" />
                </div>
            </div>

            <!-- Venues where this country competes -->
            <div class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2">Venues:</h3>
                <div class="space-y-2">
                    <VenueLink v-for="venue in country.venues" :key="venue.slug" :slug="venue.slug"
                        :name="venue.name" :description="venue.description" :is-inline="true" />
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">

// HANDLE DIRECT URL ---------------
const showCountryPage = ref(true);

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const country = ref<any>({
    name: 'Unknown Country',
    athletes: [],
    sports: [],
    venues: []
});

onMounted(async () => {
    try {
        const json = await fetch('/data/countries.json').then(res => res.json())
        country.value = json[slug];
    } catch (error) {
        console.error('Error loading country data:', error);
    }
});

useHead(() => {
    const name = country.value.name;
    const athleteCount = country.value.athletes?.length || 0;
    const sportCount = country.value.sports?.length || 0;

    const title = `${name} Olympic Team - Paris 2024 Olympic Games`;
    const description = `Explore the ${name} Olympic team at the Paris 2024 Olympic Games. ${athleteCount} athletes competing in ${sportCount} sports.`;

    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/country/${slug}` },
            { property: 'og:type', content: 'website' },

            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

const closePage = () => {
    showCountryPage.value = false;
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>