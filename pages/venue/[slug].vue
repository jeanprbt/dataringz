<template>
    <PageModal :title="venueData.title" :show="showVenuePage" @close="closePage">
        <div class="venue-content">
            <p>Details about {{ venueData.title }}</p>
            <!-- Example of links to other pages -->
            <div class="mt-4">
                <h3 class="text-lg font-medium mb-2">Sports at this venue:</h3>
                <div class="space-y-2">
                    <!-- These would be populated from your JSON data -->
                    <SportLink v-for="sport in sampleSports" :key="sport.slug" :slug="sport.slug" :name="sport.name" :description="sport.description" />
                </div>
            </div>
            
            <!-- Example of countries participating at this venue -->
            <div class="mt-4">
                <h3 class="text-lg font-medium mb-2">Countries competing here:</h3>
                <div class="space-y-2">
                    <!-- These would be populated from your JSON data -->
                    <CountryLink v-for="country in sampleCountries" :key="country.slug" :slug="country.slug" :name="country.name" :code="country.code" />
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
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
    },
    'stade-de-france': {
        title: 'Stade de France',
        coordinates: [2.359627, 48.924549]
    },
    'paris-la-defense-arena': {
        title: 'Paris La Défense Arena',
        coordinates: [2.229182, 48.895226],
    },
    'les-invalides': {
        title: 'Les Invalides',
        coordinates: [2.312772, 48.856091],
    }
};

// Get venue data based on the slug
const slug = route.params.slug as string;
const venueData = computed(() => {
    return venueMapping[slug as keyof typeof venueMapping] || { title: 'Unknown Venue' };
});

// Sample data for sports (this would come from your JSON files)
const sampleSports = [
    { slug: 'swimming', name: 'Swimming', description: 'Swimming competitions' },
    { slug: 'athletics', name: 'Athletics', description: 'Track and field events' },
];

// Sample data for countries (this would come from your JSON files)
const sampleCountries = [
    { slug: 'france', name: 'France', code: 'FR' },
    { slug: 'united-states', name: 'United States', code: 'US' },
];

// Close the page and navigate back to the map
function closePage() {
    showVenuePage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>