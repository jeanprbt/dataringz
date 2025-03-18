<template>
    <PageModal :title="countryData.name" :show="showCountryPage" @close="closePage">
        <div class="country-content">
            <div class="flex items-center mb-4">
                <div v-if="countryData.code" class="country-flag mr-3">
                    <img :src="`/img/flags/${countryData.code.toLowerCase()}.svg`" :alt="`Flag of ${countryData.name}`"
                        class="w-12 h-8 rounded object-cover" />
                </div>
                <h3 class="text-xl font-medium">{{ countryData.name }}</h3>
            </div>

            <p v-if="countryData.description" class="mb-4">{{ countryData.description }}</p>

            <!-- Athletes from this country -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Athletes:</h3>
                <div class="space-y-2">
                    <AthleteLink v-for="athlete in countryData.athletes" :key="athlete.slug" :slug="athlete.slug"
                        :name="athlete.name" :countryName="countryData.name" />
                </div>
            </div>

            <!-- Sports this country competes in -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Sports:</h3>
                <div class="space-y-2">
                    <SportLink v-for="sport in countryData.sports" :key="sport.slug" :slug="sport.slug"
                        :name="sport.name" :description="sport.description" />
                </div>
            </div>

            <!-- Venues where this country competes -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Venues:</h3>
                <div class="space-y-2">
                    <VenueLink v-for="venue in countryData.venues" :key="venue.slug" :slug="venue.slug"
                        :name="venue.name" :description="venue.description" />
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">

const router = useRouter();
const route = useRoute();
const showCountryPage = ref(true);

// Sample country data - you would load this from JSON files
const countryMapping = {
    'france': {
        name: 'France',
        code: 'FR',
        description: 'Host country of the 2024 Summer Olympics',
        athletes: [
            { slug: 'leon-marchand', name: 'Leon Marchand' },
            { slug: 'victor-wembanyama', name: 'Victor Wembanyama' },
        ],
        sports: [
            { slug: 'swimming', name: 'Swimming', description: 'Swimming competitions' },
            { slug: 'basketball', name: 'Basketball', description: 'Basketball tournaments' },
            { slug: 'volleyball', name: 'Volleyball', description: 'Volleyball competitions' },
        ],
        venues: [
            { slug: 'stade-de-france', name: 'Stade de France', description: 'Main stadium' },
            { slug: 'grand-palais', name: 'Grand Palais', description: 'Historic exhibition hall' },
        ]
    },
    'united-states': {
        name: 'United States',
        code: 'US',
        description: 'Team USA at the Olympic Games',
        athletes: [
            { slug: 'simone-biles', name: 'Simone Biles' },
            { slug: 'lebron-james', name: 'Lebron James' },
            { slug: 'coco-gauff', name: 'Coco Gauff' },
            { slug: 'caroline-marks', name: 'Caroline Marks' },
        ],
        sports: [
            { slug: 'swimming', name: 'Swimming', description: 'Swimming competitions' },
            { slug: 'basketball', name: 'Basketball', description: 'Basketball tournaments' },
        ],
        venues: [
            { slug: 'stade-de-france', name: 'Stade de France', description: 'Main stadium' },
            { slug: 'paris-la-defense-arena', name: 'Paris La Défense Arena', description: 'Modern indoor arena' },
        ]
    }
};

// Get country data based on the slug
const slug = route.params.slug as string;
const countryData = computed(() => {
    return countryMapping[slug as keyof typeof countryMapping] || {
        name: 'Unknown Country',
        athletes: [],
        sports: [],
        venues: []
    };
});

// Close the page and navigate back to the map
function closePage() {
    showCountryPage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>