<template>
    <PageModal :show="showCountryPage" :transition="false" :countries="true" @close="closePage">
        <div class="grid grid-cols-12 grid-rows-12 gap-4 p-2 h-full">

            <!-- Flag Card -->
            <div class="col-span-2 row-span-3 rounded-lg overflow-hidden flex items-center justify-center">
                <img :src="country.img" :alt="country.name + ' flag'" class="w-full h-full object-cover" />
            </div>

            <!-- Country Name -->
            <UCard variant="soft" :ui="{ 'body': 'p-6 md:p-6 h-full flex items-center justify-center' }" class="col-span-4 row-span-3">
                <template #default>
                    <h1 class="text-3xl font-semibold text-gray-800 text-center">
                        {{ country.name }} ({{ country.country_code }})
                    </h1>
                </template>
            </UCard>

            <!-- Medal Ranking -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary" v-if="countryMedals">#{{ countryMedals.rank }}</div>
                        <div class="text-3xl font-bold text-gray-400" v-else>-</div>
                        <div class="text-sm text-gray-600">Medal Ranking</div>
                    </div>
                </template>
            </UCard>

            <!-- Athletes -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary">{{ athleteCount }}</div>
                        <div class="text-sm text-gray-600">Athletes</div>
                    </div>
                </template>
            </UCard>

            <!-- Sports -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full flex items-center justify-center' }" class="col-span-2 row-span-3">
                <template #default>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary">{{ uniqueSportsCount }}</div>
                        <div class="text-sm text-gray-600">Sports</div>
                    </div>
                </template>
            </UCard>

            <!-- Gender Repartition -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" class="col-span-6 row-span-5 flex flex-col">
                <template #default>
                    <div class="h-full">
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Gender distribution</h3>
                        <D3GenderPieChart :slug="slug" :type="'country'" />
                    </div>
                </template>
            </UCard>

            <!-- Comparative Graphs on Medals with other countries -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" class="col-span-6 row-span-5 flex flex-col">
                <template #default>
                    <div class="flex-grow flex items-center">
                        <h1 class="text-3xl font-bold text-gray-800">
                            Comparative Graph on Meedals
                        </h1>
                    </div>
                </template>
            </UCard>

            <!-- Most Successful Sport -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" class="col-span-4 row-span-4 flex flex-col">
                <template #default>
                    <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Best Sport</h3>
                    <div class="flex-grow flex items-center justify-center px-5">
                        <div v-if="bestSport" class="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
                            <div class="flex flex-col items-center space-y-2">
                                <img :src="`/img/sports/SVG/${bestSport.slug}.svg`" class="w-16 h-16" />
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ bestSport.name }}</span>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-center md:justify-start space-x-2">
                                    <span class="text-2xl font-bold text-yellow-500">{{ bestSport.medals.gold }}</span>
                                    <span class="text-sm text-gray-600">Gold</span>
                                </div>
                                <div class="flex items-center justify-center md:justify-start space-x-2">
                                    <span class="text-2xl font-bold text-gray-400">{{ bestSport.medals.silver }}</span>
                                    <span class="text-sm text-gray-600">Silver</span>
                                </div>
                                <div class="flex items-center justify-center md:justify-start space-x-2">
                                    <span class="text-2xl font-bold text-amber-700">{{ bestSport.medals.bronze }}</span>
                                    <span class="text-sm text-gray-600">Bronze</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-gray-500">
                            No medals won
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Medal Count -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" class="col-span-4 row-span-4 flex flex-col">
                <template #default>
                    <div class="flex flex-col h-full">
                        <div class="flex-grow flex items-center justify-center">
                            <div class="flex justify-around items-center space-x-8">
                                <div class="flex flex-col items-center">
                                    <span class="text-3xl font-bold text-yellow-500">{{ countryTotalMedals.gold }}</span>
                                    <span class="text-sm">Gold</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <span class="text-3xl font-bold text-gray-400">{{ countryTotalMedals.silver }}</span>
                                    <span class="text-sm">Silver</span>
                                </div>
                                <div class="flex flex-col items-center">
                                    <span class="text-3xl font-bold text-amber-700">{{ countryTotalMedals.bronze }}</span>
                                    <span class="text-sm">Bronze</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Previous Editions -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" class="col-span-4 row-span-4 flex flex-col">
                <template #default>
                    <div class="flex-grow flex items-center">
                        <h1 class="text-3xl font-bold text-gray-800">
                            Previous Editions
                        </h1>
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

definePageMeta({
    middleware: ['country'],
    layout: 'canvas'
})

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('country').value;
const showCountryPage = ref(!directAccess);
onMounted(async () => {
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

// Count unique sports the country participates in
const uniqueSportsCount = computed(() => {
    // Get all athlete entries for this country
    const countryAthletes = Object.values(athletes)
        .filter(athlete => athlete.country.name === country.name);

    // Get unique sport disciplines from these athletes
    const uniqueSports = new Set();

    // First, collect all disciplines
    countryAthletes.forEach(athlete => {
        if (athlete.discipline) {
            // Get the base sport slug for the discipline
            const sportSlug = getSportSlugFromDiscipline(athlete.discipline);
            uniqueSports.add(sportSlug);
        }
    });

    // Return the count of unique sports
    return uniqueSports.size;
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
</script>
