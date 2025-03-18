<template>
    <PageModal :title="sportData.name" :show="showSportPage" @close="closePage">
        <div class="sport-content">
            <div class="flex items-center mb-4">
                <div class="sport-icon mr-3">
                    <div class="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
                <h3 class="text-xl font-medium">{{ sportData.name }}</h3>
            </div>
            
            <p v-if="sportData.description" class="mb-6 text-gray-700 dark:text-gray-300">{{ sportData.description }}</p>
            
            <!-- Events for this sport -->
            <div v-if="sportData.events && sportData.events.length > 0" class="mt-6">
                <h3 class="text-lg font-medium mb-2">Events:</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li v-for="(event, index) in sportData.events" :key="index">
                        {{ event }}
                    </li>
                </ul>
            </div>
            
            <!-- Athletes competing in this sport -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Athletes:</h3>
                <div class="space-y-2">
                    <AthleteLink v-for="athlete in sportData.athletes" :key="athlete.slug" 
                                :slug="athlete.slug" 
                                :name="athlete.name" />
                </div>
            </div>
            
            <!-- Countries participating in this sport -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Countries:</h3>
                <div class="space-y-2">
                    <CountryLink v-for="country in sportData.countries" :key="country.slug" 
                                :slug="country.slug" 
                                :name="country.name" 
                                :code="country.code" />
                </div>
            </div>
            
            <!-- Venues for this sport -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Venues:</h3>
                <div class="space-y-2">
                    <VenueLink v-for="venue in sportData.venues" :key="venue.slug" 
                              :slug="venue.slug" 
                              :name="venue.name" 
                              :description="venue.description" />
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const showSportPage = ref(true);

// Sample sport data - you would load this from JSON files
const sportMapping = {
    'swimming': {
        name: 'Swimming',
        description: 'Competitive swimming is an Olympic sport where athletes compete in events in a swimming pool. Events are categorized by different strokes and distances.',
        events: [
            '50m Freestyle',
            '100m Freestyle',
            '200m Freestyle',
            '400m Freestyle',
            '100m Butterfly',
            '4x100m Freestyle Relay'
        ],
        athletes: [
            { slug: 'leon-marchand', name: 'Leon Marchand' },
            { slug: 'summer-mcintosh', name: 'Summer McIntosh' },
            { slug: 'katie-ledecky', name: 'Katie Ledecky' },
        ],
        countries: [
            { slug: 'france', name: 'France', code: 'FR' },
            { slug: 'usa', name: 'United States', code: 'US' }
        ],
        venues: [
            { slug: 'paris-la-defense-arena', name: 'Paris La Défense Arena', description: 'Swimming events venue' }
        ]
    },
    'athletics': {
        name: 'Athletics',
        description: 'Athletics comprises various track and field events including running, jumping, and throwing competitions.',
        events: [
            '100m Sprint',
            '200m Sprint',
            '400m Sprint',
            '100m Hurdles',
            'Long Jump',
            'High Jump',
            'Shot Put'
        ],
        athletes: [
            { slug: 'armand-duplantis', name: 'Armand Duplantis' },
            { slug: 'yulimar-rojas', name: 'Yulimar Rojas' },
        ],
        countries: [
            { slug: 'france', name: 'France', code: 'FR' },
            { slug: 'usa', name: 'United States', code: 'US' }
        ],
        venues: [
            { slug: 'stade-de-france', name: 'Stade de France', description: 'Main athletics stadium' }
        ]
    }
};

// Get sport data based on the slug
const slug = route.params.slug as string;
const sportData = computed(() => {
    return sportMapping[slug as keyof typeof sportMapping] || { 
        name: 'Unknown Sport',
        events: [],
        athletes: [],
        countries: [],
        venues: []
    };
});

// Close the page and navigate back to the map
function closePage() {
    showSportPage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script> 