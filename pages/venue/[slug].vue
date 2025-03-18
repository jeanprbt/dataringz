<template>
    <PageModal :title="venueData.name" :show="showVenuePage" @close="closePage">
        <div class="venue-content">
            <p>Details about {{ venueData.name }}</p>
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

const venues: GeoJSON.FeatureCollection<GeoJSON.Point> = (
    await fetch('/geojson/venues.geojson').then((res) => res.json())
);


// Get venue data from slug
const slug = route.params.slug as string;
const venueData = computed(() => {
    return venues.features.find(feature => feature.properties?.slug === slug)?.properties || {name: 'Unknown Venue' };
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
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>