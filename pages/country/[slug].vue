<template>
    <PageModal :show="showCountryPage" :transition="false" :countries="true" @close="closePage">
        <div :class="[
            'h-full',
            selected === 0 ? 'grid grid-cols-12 grid-rows-12 gap-4 p-2' : 'relative'
        ]">

            <div v-if="selected !== 0" class="absolute inset-0 z-5"></div>

            <!-- Flag Card - only visible in grid mode -->
            <div v-if="selected === 0"
                class="col-span-2 row-span-3 rounded-lg overflow-hidden flex items-center justify-center">
                <img :src="country.img" :alt="country.name + ' flag'" class="w-full h-full object-cover" />
            </div>

            <!-- Country Name - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft"
                :ui="{ 'body': 'p-6 md:p-6 h-full flex items-center justify-center' }" class="col-span-4 row-span-3">
                <template #default>
                    <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center">
                        {{ country.name }} ({{ country.country_code }})
                    </h1>
                </template>
            </UCard>

            <!-- Medal Ranking - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft"
                :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary" v-if="countryMedals">#{{ countryMedals.rank }}
                        </div>
                        <div class="text-3xl font-bold text-gray-400" v-else>-</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Medal Ranking</div>
                    </div>
                </template>
            </UCard>

            <!-- Athletes - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft"
                :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary">{{ athleteCount }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Athletes</div>
                    </div>
                </template>
            </UCard>

            <!-- Sports - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft"
                :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="flex items-center justify-center gap-1">
                            <span class="text-3xl font-bold text-primary">{{ uniqueSportsCount }}</span>
                            <span class="text-lg text-gray-500 font-medium">/</span>
                            <span class="text-lg text-gray-500 font-medium">45</span>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Olympic Sports</div>
                    </div>
                </template>
            </UCard>

            <!-- Most Successful Sport - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }"
                class="col-span-6 row-span-5 flex flex-col h-full">
                <template #default>
                    <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Best Sport</h3>
                    <div class="flex-grow h-full flex items-center justify-center px-3">
                        <div v-if="bestSport"
                            class="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
                            <div class="flex flex-col items-center space-y-2">
                                <img :src="`/img/sports/SVG/${bestSport.slug}.svg`" class="w-16 h-16 dark:invert" />
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ bestSport.name }}
                                </span>
                            </div>

                            <div class="flex space-x-8">
                                <div class="flex flex-col space-y-2 items-end">
                                    <span class="text-2xl font-bold text-yellow-500 leading-8">
                                        {{ bestSport.medals.gold }}
                                    </span>
                                    <span class="text-2xl font-bold text-gray-400 leading-8">
                                        {{ bestSport.medals.silver }}
                                    </span>
                                    <span class="text-2xl font-bold text-amber-700 leading-8">
                                        {{ bestSport.medals.bronze }}
                                    </span>
                                </div>

                                <div class="flex flex-col space-y-2 justify-center">
                                    <span class="text-sm text-gray-600 dark:text-gray-400 leading-8">Gold</span>
                                    <span class="text-sm text-gray-600 dark:text-gray-400 leading-8">Silver</span>
                                    <span class="text-sm text-gray-600 dark:text-gray-400 leading-8">Bronze</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-gray-500 text-center text-lg">
                            No medals won
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Medal Count - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }"
                class="col-span-6 row-span-5 flex flex-col">
                <template #default>
                    <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Paris 2024 Totals</h3>
                    <div class="flex flex-col h-full">
                        <div class="flex-grow flex items-center justify-center">
                            <div class="flex justify-around items-center space-x-8">
                                <div class="flex flex-col items-center">
                                    <div class="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-2">
                                        <span class="font-bold text-xl text-white">{{ countryTotalMedals.gold }}</span>
                                    </div>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Gold</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                                        <span class="font-bold text-xl text-white">{{ countryTotalMedals.silver }}</span>
                                    </div>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Silver</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <div class="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center mb-2">
                                        <span class="font-bold text-xl text-white">{{ countryTotalMedals.bronze }}</span>
                                    </div>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Bronze</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Gender Repartition - only visible in grid mode -->
            <UCard v-if="selected === 0" variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }"
                class="col-span-4 row-span-4 flex flex-col">
                <template #default>
                    <div class="h-full">
                        <D3GenderPieChart :slug="slug" :type="'country'" />
                    </div>
                </template>
            </UCard>

            <!-- Comparative Graph on Medals -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-4 row-span-4': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'absolute inset-0 m-2 z-20 transition-all duration-500 transform': selected === 1,
                'hidden': selected !== 0 && selected !== 1
            }" @click="selected === 1 ? () => { } : toggleCard(1)" @mouseenter="compareCardHovered = true"
                @mouseleave="compareCardHovered = false">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 1" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-30"
                            @click.stop="toggleCard(1)" />
                        <h3 class="text-lg font-medium mb-4">Medal Comparison</h3>
                        <!-- Full screen content here -->
                        <div class="p-4">
                            <D3MedalsComparisonHistogram :country-slug="country.slug" />
                        </div>
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="compareCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <h3 class="text-lg font-medium">Medal Comparison</h3>
                        <div class="flex items-center justify-center h-[calc(110%)]">
                            <img v-if="!isSmallScreen" class="w-auto h-full p-12 object-contain"
                                src="/img/comparison.png" alt="Foo chart" />
                        </div>
                    </div>
                </template>
            </UCard>

            

            <!-- Previous Editions -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" :class="{
                'col-span-4 row-span-4': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'absolute inset-0 m-2 z-20 transition-all duration-500 transform': selected === 2,
                'hidden': selected !== 0 && selected !== 2
            }" @click="selected === 2 ? () => { } : toggleCard(2)" @mouseenter="historyCardHovered = true"
                @mouseleave="historyCardHovered = false">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 2" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-30"
                            @click.stop="toggleCard(2)" />
                        <h3 class="text-lg font-medium mb-4">Previous Editions</h3>
                        <OlympicMedalHistory :country-slug="country.slug" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="historyCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <h3 class="text-lg font-medium">Previous Editions</h3>
                        <div class="flex items-center justify-center h-[calc(110%)]">
                            <img v-if="!isSmallScreen" class="w-auto h-full p-12 object-contain"
                                src="/img/history_book.png" alt="History Book" />
                        </div>
                    </div>
                </template>
            </UCard>

        </div>
    </PageModal>
</template>






<script setup>
import countries from '~/data/countries.json';
import medals_total from '~/data/medals_total.json';
import athletes from '~/data/athletes.json';
import medals from '~/data/medals.json';
import sports from '~/data/sports.json';
import { count } from 'd3';

definePageMeta({
    middleware: ['country'],
    layout: 'canvas'
})

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('country').value;
const showCountryPage = ref(!directAccess);
const isSmallScreen = ref(false);

onMounted(async () => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
    if (directAccess) {
        setTimeout(() => showCountryPage.value = true, 2200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug;

// DATA MANAGEMENT -----------------
const country = countries[slug];

// Calculate number of athletes for this country
const athleteCount = computed(() => {
    // Using country code for more reliable matching
    return Object.values(athletes)
        .filter(athlete => athlete.country.name === country.name).length;
});

// Get medals for this country from medals_total
const countryMedals = computed(() => {
    return medals_total.find(m => m.country_code === country.country_code);
});

// Create a map of discipline names to sport slugs using sports.json
const createSportDisciplineMap = () => {
    const disciplineMap = {};

    Object.entries(sports).forEach(([sportSlug, sportInfo]) => {
        // Map the main sport name
        disciplineMap[sportInfo.name] = sportSlug;

        // Some disciplines are variations of the sport name
        const variations = [
            `${sportInfo.name} - Men`,
            `${sportInfo.name} - Women`,
            `Men's ${sportInfo.name}`,
            `Women's ${sportInfo.name}`
        ];

        variations.forEach(variation => {
            disciplineMap[variation] = sportSlug;
        });
    });

    return disciplineMap;
};

const sportDisciplineMap = createSportDisciplineMap();

// Function to get sport slug from discipline
const getSportSlugFromDiscipline = (discipline) => {
    // Direct match
    if (sportDisciplineMap[discipline]) {
        return sportDisciplineMap[discipline];
    }

    // Try to find a partial match
    for (const [key, value] of Object.entries(sportDisciplineMap)) {
        if (discipline.includes(key) || key.includes(discipline)) {
            return value;
        }
    }

    // Fallback: normalize the discipline name
    return discipline.toLowerCase().replace(/\s+/g, '-');
};

// Calculate total medals for the country using medals.json
const countryTotalMedals = computed(() => {
    const countryMedals = medals.filter(medal =>
        medal.country_code === country.country_code
    );

    const totalMedals = {
        gold: 0,
        silver: 0,
        bronze: 0
    };

    countryMedals.forEach(medal => {
        if (medal.medal_type === "Gold Medal") {
            totalMedals.gold += 1;
        } else if (medal.medal_type === "Silver Medal") {
            totalMedals.silver += 1;
        } else if (medal.medal_type === "Bronze Medal") {
            totalMedals.bronze += 1;
        }
    });

    return totalMedals;
});

// Calculate number of unique sports for this country
const uniqueSportsCount = computed(() => {
    // Get all athletes from this country
    const countryAthletes = Object.values(athletes)
        .filter(athlete => athlete.country.name === country.name);

    // Create a Set to store unique sport slugs
    const uniqueSportsSlugs = new Set();

    // Add each sport slug to the Set
    countryAthletes.forEach(athlete => {
        if (athlete.sports && athlete.sports.length > 0) {
            athlete.sports.forEach(sport => {
                if (sport.slug) {
                    uniqueSportsSlugs.add(sport.slug);
                }
            });
        }
    });
    // Return the count of unique sports
    return uniqueSportsSlugs.size;
});


// Calculate best sport by medals using medals.json
const bestSport = computed(() => {
    const countryMedals = medals.filter(medal =>
        medal.country_code === country.country_code
    );

    if (countryMedals.length === 0) {
        return null;
    }

    // Group medals by sport
    const sportMedals = {};

    countryMedals.forEach(medal => {
        const discipline = medal.discipline;
        const sportSlug = getSportSlugFromDiscipline(discipline);
        const sportName = sports[sportSlug]?.name || discipline;

        if (!sportMedals[sportSlug]) {
            sportMedals[sportSlug] = {
                slug: sportSlug,
                name: sportName,
                medals: { gold: 0, silver: 0, bronze: 0 }
            };
        }

        if (medal.medal_type === "Gold Medal") {
            sportMedals[sportSlug].medals.gold += 1;
        } else if (medal.medal_type === "Silver Medal") {
            sportMedals[sportSlug].medals.silver += 1;
        } else if (medal.medal_type === "Bronze Medal") {
            sportMedals[sportSlug].medals.bronze += 1;
        }
    });

    // Find the best sport prioritizing gold, then silver, then bronze
    let bestSport = null;
    let maxGold = -1;
    let maxSilver = -1;
    let maxBronze = -1;

    Object.values(sportMedals).forEach(sport => {
        // Check if this sport has more gold medals
        if (sport.medals.gold > maxGold) {
            maxGold = sport.medals.gold;
            maxSilver = sport.medals.silver;
            maxBronze = sport.medals.bronze;
            bestSport = sport;
        }
        // If gold medals are tied, check silver medals
        else if (sport.medals.gold === maxGold && sport.medals.silver > maxSilver) {
            maxSilver = sport.medals.silver;
            maxBronze = sport.medals.bronze;
            bestSport = sport;
        }
        // If gold and silver medals are tied, check bronze medals
        else if (sport.medals.gold === maxGold && sport.medals.silver === maxSilver && sport.medals.bronze > maxBronze) {
            maxBronze = sport.medals.bronze;
            bestSport = sport;
        }
    });

    return bestSport;
});

// HANDLE CLOSE BUTTON -------------
const closePage = () => {
    showCountryPage.value = false;
    router.push('/');
}

// UI STATE for expandable cards
const selected = ref(0);
const previous = ref(0);
const transitioning = ref(false);
const compareCardHovered = ref(false);
const historyCardHovered = ref(false);

const toggleCard = (index = 0) => {
    if (selected.value !== 0) {
        previous.value = selected.value;
        transitioning.value = true;
        selected.value = 0;
        setTimeout(() => {
            transitioning.value = false;
        }, 500);
    }
    else selected.value = index;
}
</script>
