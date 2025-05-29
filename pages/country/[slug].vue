<template>
    <PageModal :show="showCountryPage" :back="transition" :transition="transition" :items="items" :countries="true"
        @close="closePage">
        <div v-if="country"
            :class="['gap-4 p-2 h-full flex flex-col md:overflow-hidden', { 'grid grid-cols-12 md:grid-rows-6': selected === 0 }]">

            <UCard variant="soft" :ui="{ 'body': 'p-0 md:p-0 h-full' }" :class="{
                'col-span-6 md:col-span-4 md:row-span-2': selected === 0,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <div class="w-full h-full rounded-lg flex justify-center items-center">
                        <img :src="country.img" :alt="country.name + ' flag'"
                            class="w-full h-full rounded-lg object-cover" />
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-4 h-full' }" :class="{
                'col-span-6 md:col-span-3 md:row-span-1 flex-shrink-0': selected === 0 && bestSport,
                'col-span-6 md:col-span-8 md:row-span-2': selected === 0 && !bestSport,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex flex-col h-full justify-center">
                        <h2 class="text-base md:text-2xl font-bold text-zinc-800 dark:text-white">{{ country.name }}
                        </h2>
                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">{{ country.country_code }}</p>
                    </div>
                </template>
            </UCard>

            <UCard v-if="bestSport" variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-5 md:row-span-2': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <NuxtLink :to="`/sport/${bestSport.slug}`" class="h-full flex flex-col">
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                            Best sport
                        </h2>
                        <div class="flex h-full items-center justify-center gap-4 md:gap-10">
                            <div class="flex flex-col items-center gap-4">
                                <div class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                                    <img :src="`/img/sports/SVG/${bestSport.slug}.svg`"
                                        class="w-full h-full object-contain dark:invert" />
                                </div>
                                <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">{{ bestSport.name }}</p>
                            </div>

                            <div class="flex gap-8">
                                <div class="flex flex-col gap-1 items-start">
                                    <div
                                        class="flex items-center gap-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-900 px-4 py-1">
                                        <span class="text-2xl font-bold text-yellow-500 leading-8">
                                            {{ bestSport.medals.gold }}
                                        </span>
                                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Gold</p>
                                    </div>
                                    <div
                                        class="flex items-center gap-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-900 px-4 py-1">
                                        <span class="text-2xl font-bold text-gray-400 leading-8">
                                            {{ bestSport.medals.silver }}
                                        </span>
                                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Silver</p>
                                    </div>
                                    <div
                                        class="flex items-center gap-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-900 px-4 py-1">
                                        <span class="text-2xl font-bold text-amber-700 leading-8">
                                            {{ bestSport.medals.bronze }}
                                        </span>
                                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Bronze</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NuxtLink>
                </template>
            </UCard>

            <UCard v-if="bestSport" variant="soft" :ui="{ 'body': 'flex h-full items-center' }" :class="{
                'col-span-6 md:col-span-3 md:row-span-1': selected === 0,
                'hidden': selected !== 0 && selected !== 4
            }">
                <template #default>
                    <div class="flex flex-col h-full justify-center gap-1">
                        <div class="flex items-center gap-1">
                            <h2 class="text-lg md:text-3xl font-bold text-zinc-800 dark:text-white">
                                {{ country.rank }}
                            </h2>
                            <span class="text-lg text-gray-500 font-medium">/ 85</span>
                        </div>
                        <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Medal Ranking</p>
                    </div>
                </template>
            </UCard>

            <UCard v-if="!isSmallScreen" variant="soft" :ui="{ 'body': 'p-0 sm:p-0 h-full' }" :class="{
                'col-span-12 md:col-span-4 md:row-span-2': selected === 0 && country.previous_editions.length > 0,
                'col-span-12 md:col-span-4 md:row-span-4': selected === 0 && country.previous_editions.length === 0,
                'hidden': selected !== 0 && selected !== 8
            }">
                <template #default>
                    <div ref="countryMapContainer" class="w-full h-full rounded-lg"></div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'flex h-full items-center' }" :class="{
                'col-span-6 md:col-span-2 md:row-span-1': selected === 0,
                'hidden': selected !== 0 && selected !== 5
            }">
                <template #default>
                    <div class="flex flex-col h-full justify-center gap-1">
                        <h2 class="text-lg md:text-3xl font-bold text-zinc-800 dark:text-white">
                            {{ athleteCount }}
                        </h2>
                        <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Athletes</p>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'flex h-full items-center' }" :class="{
                'col-span-12 md:col-span-2 md:row-span-1': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 6,
                'transition-all duration-500 transform h-full': selected === 6,
                'hidden': selected !== 0 && selected !== 6
            }" @click="selected === 6 ? () => { } : toggleCard(6)" @mouseenter="sportsCardHovered = true"
                @mouseleave="sportsCardHovered = false">
                <template #default>
                    <div v-if="selected === 6" class="h-full w-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-30"
                            @click.stop="toggleCard(6)" />
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">
                            Olympic sports | {{ country.name }}
                        </h2>
                        <div
                            class="grid [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))] gap-4 h-full w-full mt-5">
                            <NuxtLink v-for="(sport, index) in countrySports" :to="`/sport/${sport.slug}`" :key="index"
                                :class="[
                                    'w-full h-full flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-200/60 dark:bg-zinc-900',
                                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                                ]">
                                <img :src="`/img/sports/SVG/${sport.slug}.svg`" :alt="sport.name"
                                    class="w-12 h-12 mb-2 dark:filter dark:invert dark:brightness-90" />
                                <span class="text-center text-sm font-medium text-zinc-600 dark:text-gray-300">
                                    {{ sport.name }}
                                </span>
                            </NuxtLink>
                        </div>
                    </div>
                    <div v-else class="flex flex-col h-full w-full justify-center gap-1 relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="sportsCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute top-0 right-0" />
                        </transition>
                        <div class="flex items-center gap-1">
                            <h2 class="text-lg md:text-3xl font-bold text-zinc-800 dark:text-white">
                                {{ uniqueSportsCount }}
                            </h2>
                            <span class="text-lg text-gray-500 font-medium">/ 45</span>
                        </div>
                        <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Olympics Sports</p>
                    </div>
                </template>
            </UCard>


            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-4 md:row-span-2': selected === 0,
                'hidden': selected !== 0 && selected !== 7
            }"><template #default>
                    <div class="flex flex-col h-full gap-4">
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">
                            Medals
                        </h2>
                        <div class="grid grid-cols-3 gap-4 mb-4 h-full">
                            <div v-for="(count, type) in { 'Gold': countryTotalMedals.gold, 'Silver': countryTotalMedals.silver, 'Bronze': countryTotalMedals.bronze }"
                                :key="type"
                                class="flex flex-col items-center justify-center p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                <div
                                    :class="`w-8 h-8 rounded-full flex items-center justify-center ${medalColorClass(type)} mb-1`">
                                    <span class="text-white font-bold text-base">
                                        {{ medalEmojiMap[type] }}
                                    </span>
                                </div>
                                <div class="text-xl font-bold text-zinc-800 dark:text-white">{{ count }}</div>
                                <div class="text-xs text-zinc-600 dark:text-gray-400">{{ type }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>


            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" v-if="!isSmallScreen" :class="{
                'col-span-12 md:col-span-4 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && isSmallScreen,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 9,
                'transition-all duration-500 transform h-full': selected === 9,
                'hidden': selected !== 0 && selected !== 9
            }" @click="isSmallScreen ? selected === 9 ? () => { } : toggleCard(9) : () => { }">
                <template #default>
                    <div v-if="selected === 9 && isSmallScreen" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <D3GenderPieChart :slug="slug" :type="'country'" />
                    </div>
                    <div v-if="isSmallScreen" class="h-full relative flex items-center">
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">
                            Gender distribution
                        </h2>
                    </div>
                    <div v-else class="h-full">
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">
                            Gender distribution
                        </h2>
                        <D3GenderPieChart :slug="slug" :type="'country'" />
                    </div>
                </template>
            </UCard>

            <UCard v-if="!isSmallScreen && country.previous_editions.length > 0" variant="soft"
                :ui="{ 'body': 'h-full' }" :class="{
                    'col-span-12 md:col-span-4 row-span-2': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-full-screen h-full': selected === 10,
                    'animate-bento-card': selected === 0 && transitioning && previousCard === 10,
                    'hidden': selected !== 0 && selected !== 10
                }" @click="selected === 10 ? () => { } : toggleCard(10)" @mouseenter="historyCardHovered = true"
                @mouseleave="historyCardHovered = false">
                <template #default>
                    <div v-if="selected === 10" class="h-full relative overflow-auto flex flex-col">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-30"
                            @click.stop="toggleCard(10)" />
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">Previous editions</h2>
                        <D3OlympicMedalHistory :country="country.slug" class="h-full" />
                    </div>
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="historyCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">
                            Previous editions
                        </h2>
                        <div class="flex items-center justify-center h-[80%]">
                            <D3PreviewFooMedalHistory class="w-full h-full" />
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="!isSmallScreen" variant="soft" :ui="{ 'body': 'p-4 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-4 row-span-2': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-full-screen h-full': selected === 11,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 11,
                'hidden': selected !== 0 && selected !== 11
            }" @click="selected === 11 ? () => { } : toggleCard(11)" @mouseenter="compareCardHovered = true"
                @mouseleave="compareCardHovered = false">
                <template #default>
                    <div v-if="selected === 11" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCard(11)" />
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">Medals comparison</h2>
                        <div class="p-4 h-full">
                            <D3MedalsComparisonHistogram :country-slug="country.slug" />
                        </div>
                    </div>
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="compareCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">Medals comparison</h2>
                        <div class="flex items-center justify-center h-[80%]">
                            <D3PreviewFooMedalsComparison class="w-full h-full" />
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
        <div v-else class="h-full flex items-center justify-center">
            <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Country not found.</p>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';

import countries from '~/data/countries.json';
import athletes from '~/data/athletes.json';
import sports from '~/data/sports.json';
import medals from '~/data/medals.json';

definePageMeta({
    middleware: ['country', 'previous', 'breadcrumb'],
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
const slug = route.params.slug as string;

// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previous = useState('previous');
const transition = computed(() => previous.value && previous.value !== '/' && !directAccess) as ComputedRef<boolean>;

// DATA MANAGEMENT -----------------
const country = countries[slug as keyof typeof countries] as any;

const countrySports = computed(() => {
    const countryAthletes = Object.values(athletes).filter(athlete => athlete.country === country.slug);
    const uniqueSlugs = new Set();
    countryAthletes.forEach(athlete => {
        if (athlete.sports && athlete.sports.length > 0) {
            athlete.sports.forEach((sportSlug: any) => {
                uniqueSlugs.add(sportSlug);
            });
        }
    });
    const uniqueSports: any[] = [];
    uniqueSlugs.forEach(sportSlug => {
        uniqueSports.push(sports[sportSlug as keyof typeof sports]);
    })
    return uniqueSports;
});
const uniqueSportsCount = computed(() => countrySports.value.length);

const athleteCount = computed(() => {
    return Object.values(athletes)
        .filter(athlete => athlete.country === country.slug).length;
});

const sportDisciplineMap = {} as any;
Object.entries(sports).forEach(([sportSlug, sportInfo]) => {
    sportDisciplineMap[sportInfo.name] = sportSlug;
});

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

const bestSport = computed<any>(() => {
    const countryMedals = medals.filter(medal => medal.country_code === country.country_code);
    if (countryMedals.length === 0) return null;

    const sportMedals = {} as any;
    countryMedals.forEach(medal => {
        const discipline = medal.discipline;
        const sportSlug = sportDisciplineMap[discipline] || '';
        const sportName = sports[sportSlug as keyof typeof sports]?.name || discipline;

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

    let bestSport = null;
    let maxGold = -1;
    let maxSilver = -1;
    let maxBronze = -1;

    Object.values(sportMedals).forEach((sport: any) => {
        if (sport.medals.gold > maxGold) {
            maxGold = sport.medals.gold;
            maxSilver = sport.medals.silver;
            maxBronze = sport.medals.bronze;
            bestSport = sport;
        }
        else if (sport.medals.gold === maxGold && sport.medals.silver > maxSilver) {
            maxSilver = sport.medals.silver;
            maxBronze = sport.medals.bronze;
            bestSport = sport;
        }
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

// UI STATE
const selected = ref(0);
const previousCard = ref(0);
const transitioning = ref(false);
const compareCardHovered = ref(false);
const historyCardHovered = ref(false);
const sportsCardHovered = ref(false);
const toggleCard = (index = 0) => {
    historyCardHovered.value = false;
    compareCardHovered.value = false;
    sportsCardHovered.value = false;
    if (selected.value !== 0) {
        previousCard.value = selected.value;
        transitioning.value = true;
        selected.value = 0;
        setTimeout(() => {
            transitioning.value = false;
        }, 500);
    }
    else selected.value = index;
}

// HELPERS ------------------------
const medalEmojiMap: Record<string, string> = {
    'Gold': '🥇',
    'Silver': '🥈',
    'Bronze': '🥉'
};

const medalColorClass = (type: string) => {
    const medalType = type.split(' ')[0];
    switch (medalType) {
        case 'Gold': return 'bg-amber-400/60';
        case 'Silver': return 'bg-zinc-400/60';
        case 'Bronze': return 'bg-amber-700/60';
        default: return 'bg-zinc-500/60';
    }
};

// MAP -----------------------------
const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) { mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '' };
const countryMapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
    if (country === undefined) return;
    if (countryMapContainer.value) {
        const map = new mapboxgl.Map({
            container: countryMapContainer.value as HTMLElement,
            style: 'mapbox://styles/mapbox/standard',
            center: [country.location.longitude, country.location.latitude] as [number, number],
            zoom: 4,
            pitch: 10,
            bearing: 0,
            maxZoom: 8,
            minZoom: 2
        });
        new mapboxgl.Marker({ color: 'red' })
            .setLngLat([country.location.longitude, country.location.latitude] as [number, number])
            .addTo(map)
    } else {
        watch(countryMapContainer, newValue => {
            const map = new mapboxgl.Map({
                container: newValue as HTMLElement,
                style: 'mapbox://styles/mapbox/standard',
                center: [country.location.longitude, country.location.latitude] as [number, number],
                zoom: 4,
                pitch: 10,
                bearing: 0,
                maxZoom: 8,
                minZoom: 2
            });
            new mapboxgl.Marker({ color: 'red' })
                .setLngLat([country.location.longitude, country.location.latitude] as [number, number])
                .addTo(map)
        })
    }
});

</script>