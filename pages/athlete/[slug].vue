<template>
    <PageModal :title="athleteData.name" :show="showAthletePage" @close="closePage">
        <div v-if="isLoading" class="flex justify-center items-center h-48">
            <span class="mr-3">Loading athlete data</span>
            <UIcon name="i-svg-spinners-ring-resize" class="h-6 w-6 text-primary" />
        </div>
        <div v-else class="athlete-content">
            <div class="flex items-center mb-6">
                <div class="athlete-photo mr-4">
                    <AthletePicture :name="athleteData.name" :slug="slug" size="lg" />
                </div>
                <div class="athlete-info">
                    <h3 class="text-xl font-medium">{{ athleteData.name }}</h3>
                    <div v-if="athleteData.country" class="mt-1 flex items-center">
                        <CountryLink :slug="athleteData.country.slug" :name="athleteData.country.name"
                            :code="athleteData.country.code" />
                    </div>
                    <div v-if="athleteData.age" class="text-sm text-gray-600 dark:text-gray-300 mt-1">Age: {{
                        athleteData.age }}</div>
                </div>
            </div>

            <div v-if="athleteData.bio" class="mb-6">
                <h3 class="text-lg font-medium mb-2">Bio</h3>
                <p class="text-gray-700 dark:text-gray-300">{{ athleteData.bio }}</p>
            </div>

            <!-- Additional information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-if="athleteData.birth_place" class="text-sm">
                    <span class="font-medium">Birth Place:</span> {{ athleteData.birth_place }}, {{
                        athleteData.birth_country }}
                </div>
                <div v-if="athleteData.height && athleteData.height > 0" class="text-sm">
                    <span class="font-medium">Height:</span> {{ athleteData.height }} cm
                </div>
                <div v-if="athleteData.weight && athleteData.weight > 0" class="text-sm">
                    <span class="font-medium">Weight:</span> {{ athleteData.weight }} kg
                </div>
                <div v-if="athleteData.coach" class="text-sm">
                    <span class="font-medium">Coach:</span> {{ athleteData.coach }}
                </div>
                <div v-if="athleteData.occupation" class="text-sm">
                    <span class="font-medium">Occupation:</span> {{ athleteData.occupation }}
                </div>
                <div v-if="athleteData.education" class="text-sm">
                    <span class="font-medium">Education:</span> {{ athleteData.education }}
                </div>
            </div>

            <!-- Athlete accomplishments and personal information -->
            <div class="grid grid-cols-1 gap-4 mt-6">
                <div v-if="athleteData.nickname" class="text-sm">
                    <span class="font-medium">Nickname:</span> {{ athleteData.nickname }}
                </div>
                <div v-if="athleteData.hobbies" class="text-sm">
                    <span class="font-medium">Hobbies:</span> {{ athleteData.hobbies }}
                </div>
                <div v-if="athleteData.family" class="text-sm">
                    <span class="font-medium">Family:</span> {{ athleteData.family }}
                </div>
                <div v-if="athleteData.languages" class="text-sm">
                    <span class="font-medium">Languages:</span> {{ athleteData.languages }}
                </div>
                <div v-if="athleteData.hero" class="text-sm">
                    <span class="font-medium">Hero/Inspiration:</span> {{ athleteData.hero }}
                </div>
            </div>

            <!-- Sports the athlete competes in -->
            <div class="mt-6">
                <h3 class="text-lg font-medium mb-2">Sports:</h3>
                <div class="space-y-2">
                    <SportLink v-for="sport in athleteData.sports" :key="sport.slug" :slug="sport.slug"
                        :name="sport.name" :description="sport.description" />
                </div>
            </div>

            <!-- Events the athlete participates in -->
            <div v-if="athleteData.events && athleteData.events.length > 0" class="mt-6">
                <h3 class="text-lg font-medium mb-2">Events:</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li v-for="(event, index) in athleteData.events" :key="index">
                        {{ event }}
                    </li>
                </ul>
            </div>

            <!-- Medal achievements section -->
            <div v-if="athleteData.achievements && athleteData.achievements.length > 0" class="mt-6">
                <h3 class="text-lg font-medium mb-2">Olympic Medals:</h3>
                <div class="space-y-2">
                    <div v-for="(medal, index) in athleteData.achievements" :key="index" 
                         class="p-3 rounded-lg flex items-center" 
                         :class="medalClasses(medal.type)">
                        <UIcon 
                            :name="getMedalIcon(medal.type)"
                            class="h-8 w-8 mr-3 flex-shrink-0" 
                        />
                        <div>
                            <div class="font-medium">{{ medal.type }}</div>
                            <div>{{ medal.event }} ({{ medal.discipline }})</div>
                            <div class="text-sm">{{ formatDate(medal.date) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
// Define athlete data types
interface Sport {
    slug: string;
    name: string;
    description: string;
}

interface Country {
    slug: string;
    name: string;
    code: string;
}

interface Medal {
    date: string;
    type: string;
    event: string;
    discipline: string;
}

interface AthleteData {
    name: string;
    name_short?: string;
    gender?: string;
    photoUrl?: string;
    country?: Country;
    nationality?: string;
    birth_date?: string;
    age?: number;
    birth_place?: string;
    birth_country?: string;
    height?: number;
    weight?: number;
    sports: Sport[];
    events: string[];
    bio?: string;
    nickname?: string;
    hobbies?: string;
    occupation?: string;
    education?: string;
    family?: string;
    languages?: string;
    coach?: string;
    hero?: string;
    achievements: Medal[];
}

interface AthletesDataMap {
    [key: string]: AthleteData;
}

const router = useRouter();
const route = useRoute();
const showAthletePage = ref(true);
const athletesData = ref<AthletesDataMap>({});
const isLoading = ref(true);

// Function to format dates nicely
function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to determine medal styling
function medalClasses(medalType: string): string {
    if (medalType.includes('Gold')) {
        return 'bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700';
    } else if (medalType.includes('Silver')) {
        return 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600';
    } else if (medalType.includes('Bronze')) {
        return 'bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700';
    }
    return 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
}

// Load data on component mount
onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await fetch('/data/athletes.json');
        athletesData.value = await response.json();
    } catch (error) {
        console.error('Failed to load athletes data:', error);
    } finally {
        isLoading.value = false;
    }
});

// Get athlete data based on the slug
const slug = route.params.slug as string;
const athleteData = computed<AthleteData>(() => {
    // First check if data is available in the loaded JSON
    if (athletesData.value && athletesData.value[slug]) {
        return athletesData.value[slug];
    }

    // Fallback data
    return {
        name: 'Unknown Athlete',
        sports: [],
        events: [],
        achievements: []
    };
});

// SEO meta tags using Nuxt's useHead
useHead(() => {
    const name = athleteData.value.name;
    const country = athleteData.value.country?.name || '';
    const sports = athleteData.value.sports.map(s => s.name).join(', ');
    const medals = athleteData.value.achievements.length > 0 
        ? `${athleteData.value.achievements.length} Olympic medals` 
        : 'Olympic athlete';
    
    const title = `${name} - Athlete from ${country}`;
    const description = `${name} is an Olympic athlete from ${country} competing in ${sports}. ${medals}.`;
    
    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph / Facebook
            { property: 'og:type', content: 'profile' },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/athlete/${slug}` },
            { property: 'profile:first_name', content: name.split(' ')[0] },
            { property: 'profile:last_name', content: name.split(' ').slice(1).join(' ') },
            
            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

// Close the page and navigate back to the map
function closePage() {
    showAthletePage.value = false;
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}

function getMedalIcon(medalType: string): string {
    if (medalType.includes('Gold')) {
        return 'i-fluent-emoji-flat-1st-place-medal';
    } else if (medalType.includes('Silver')) {
        return 'i-fluent-emoji-flat-2nd-place-medal';
    } else if (medalType.includes('Bronze')) {
        return 'i-fluent-emoji-flat-3rd-place-medal';
    }
    return 'i-heroicons-trophy';
}
</script>