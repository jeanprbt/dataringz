<template>
    <PageModal :show="showSportPage" :back="transition" :transition="transition" :items="items" @close="closePage"
        @back="router.back()">

        <div v-if="sport" :class="['gap-4 p-2 h-full', { 'grid grid-cols-12 grid-rows-6': selected === 0 }]">

            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-4 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1': selected === 0,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex flex-col justify-center h-full">
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                            {{ sport.name }}
                        </h2>
                        <p v-if="sport.description" class="text-xs md:text-sm text-zinc-600 dark:text-gray-400">
                            {{ sport.description }}
                        </p>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-6 h-full' }" :class="{
                'col-span-8 md:col-span-6 row-span-1 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && isSmallScreen,
                'animate-bento-card': selected === 0 && transitioning && previous === 3,
                'transition-all duration-500 transform h-full': selected === 3,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <div v-if="selected === 3 && isSmallScreen" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <D3GenderPieChart :slug="slug" :type="'sport'" />
                    </div>
                    <div v-else-if="isSmallScreen" class="h-full relative flex items-center">
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                            Gender distribution
                        </h2>
                    </div>
                    <div v-else class="h-full">
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                            Gender distribution
                        </h2>
                        <D3GenderPieChart :slug="slug" :type="'sport'" />
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-8 h-full' }" :class="{
                'col-span-4 md:col-span-2 row-span-1 md:row-span-2': selected === 0,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <img class="w-full h-full dark:filter dark:invert dark:brightness-90"
                        :src="`/img/sports/SVG/${slug}.svg`" :alt="`Icon of ${sport.name}`" />
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-4 row-span-1 md:row-span-2': selected === 0,
                'animate-bento-card': selected === 0 && transitioning && previous === 4,
                'animate-full-screen h-full': selected === 4,
                'hidden': selected !== 0 && selected !== 4
            }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 4" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCard(4)" />
                        <div class="flex flex-col h-full gap-2">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                                Events
                            </h2>
                            <div class="grid [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))] gap-4 flex-1">
                                <NuxtLink v-for="(event, index) in sportEvents" :to="`/event/${event.slug}`"
                                    :key="index" :class="[
                                        'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                                    ]">
                                    {{ event.name }}
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <div class="flex flex-col h-full gap-2">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                                Events
                            </h2>
                            <div class="grid grid-cols-2 gap-3 flex-1">
                                <NuxtLink v-for="(event, index) in compactEvents" :to="`/event/${event.slug}`"
                                    :key="index" :class="[
                                        'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                                    ]">
                                    {{ event.name }}
                                </NuxtLink>
                                <div v-if="eventsExpandable"
                                    @click="toggleCard(4)"
                                    @mouseenter="eventCardHovered = true" @mouseleave="eventCardHovered = false"
                                    :class="[
                                        'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center text-center border-2 border-dashed border-zinc-300 dark:border-zinc-600',
                                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30 cursor-pointer'
                                    ]">
                                    <transition enter-active-class="transition-opacity duration-500"
                                        enter-from-class="opacity-0" enter-to-class="opacity-100"
                                        leave-active-class="transition-opacity duration-500"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                                        <UIcon v-if="eventCardHovered && eventsExpandable"
                                            name="i-heroicons-arrow-up-right" class="absolute top-2 right-2" />
                                    </transition>
                                    +{{ sportEvents.length - compactEvents.length }} more
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-3': selected === 0,
                'animate-bento-card': selected === 0 && transitioning && previous === 5,
                'animate-full-screen h-full': selected === 5,
                'hidden': selected !== 0 && selected !== 5
            }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 5" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCard(5)" />

                        <div class="flex flex-col h-full gap-2">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                                Medallists
                            </h2>
                            <div class="grid [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))] gap-4 h-full">
                                <NuxtLink v-for="athlete in sportAthletes" :key="athlete.slug"
                                    :to="`/athlete/${athlete.slug}`"
                                    class="flex flex-col items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50 px-2 py-4">
                                    <span
                                        class="text-center text-xs md:text-sm font-medium text-zinc-800 dark:text-white">
                                        {{ athlete.name }}
                                    </span>
                                    <div v-if="athlete.country" class="flex items-center mt-1">
                                        <img :src="athlete.countryObj.img" :alt="`Flag of ${athlete.countryObj.name}`"
                                            class="h-3 w-4 mr-1" />
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ athlete.countryObj.name }}
                                        </span>
                                    </div>
                                    <div v-if="athlete.medals.length > 0" class="flex space-x-1 mt-2">
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Gold Medal').length > 0"
                                            class="flex items-center" title="Gold medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥇</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Gold Medal").length}}
                                            </span>
                                        </div>
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Silver Medal').length > 0"
                                            class="flex items-center" title="Silver medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥈</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Silver Medal").length}}
                                            </span>
                                        </div>
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Bronze Medal').length > 0"
                                            class="flex items-center" title="Bronze medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥉</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Bronze Medal").length}}
                                            </span>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <div class="flex flex-col h-full gap-2">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                                Medallists
                            </h2>
                            <div class="grid grid-cols-2 gap-4 flex-1">
                                <NuxtLink v-for="athlete in compactAthletes" :key="athlete.slug"
                                    :to="`/athlete/${athlete.slug}`"
                                    class="flex flex-col items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50 p-2">
                                    <span
                                        class="text-center text-xs md:text-sm font-medium text-zinc-800 dark:text-white">
                                        {{ athlete.name }}
                                    </span>
                                    <div v-if="athlete.country" class="flex items-center mt-1">
                                        <img :src="athlete.countryObj.img" :alt="`Flag of ${athlete.countryObj.name}`"
                                            class="h-3 w-4 mr-1" />
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ athlete.countryObj.name }}
                                        </span>
                                    </div>
                                    <div v-if="athlete.medals.length > 0" class="flex space-x-1 mt-2">
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Gold Medal').length > 0"
                                            class="flex items-center" title="Gold medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥇</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Gold Medal").length}}
                                            </span>
                                        </div>
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Silver Medal').length > 0"
                                            class="flex items-center" title="Silver medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥈</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Silver Medal").length}}
                                            </span>
                                        </div>
                                        <div v-if="athlete.medals.filter((m: any) => m['type'] === 'Bronze Medal').length > 0"
                                            class="flex items-center" title="Bronze medals">
                                            <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span class="text-xs">🥉</span> {{athlete.medals.filter((m: any) =>
                                                    m["type"] === "Bronze Medal").length}}
                                            </span>
                                        </div>
                                    </div>
                                </NuxtLink>
                                <div v-if="sportAthletes.length > 3"
                                    @click="toggleCard(5)"
                                    @mouseenter="athleteCardHovered = true" @mouseleave="athleteCardHovered = false"
                                    :class="[
                                        'flex flex-col items-center justify-center rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-2 relative',
                                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30 cursor-pointer'
                                    ]">
                                    <transition enter-active-class="transition-opacity duration-500"
                                        enter-from-class="opacity-0" enter-to-class="opacity-100"
                                        leave-active-class="transition-opacity duration-500"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                                        <UIcon v-if="athleteCardHovered" name="i-heroicons-arrow-up-right"
                                            class="absolute right-2 top-2" />
                                    </transition>
                                    <span
                                        class="text-center text-xs md:text-sm font-medium text-zinc-600 dark:text-gray-300">
                                        +{{ sportAthletes.length - 3 }} more
                                    </span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        medallists
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-6 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 6,
                'transition-all duration-500 transform h-full': selected === 6,
                'hidden': selected !== 0 && selected !== 6
            }" @click="selected === 6 ? () => { } : toggleCard(6)" @mouseenter="ageCardHovered = true"
                @mouseleave="ageCardHovered = false">
                <template #default>
                    <div v-if="selected === 6" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(6)" />
                        <D3AgeHistogram :sport-slug="sport.slug" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="ageCardHovered" name="i-heroicons-arrow-up-right" class="absolute right-0" />
                        </transition>
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                            Age Distribution
                        </h2>
                        <img v-if="!isSmallScreen" class="w-full h-full p-12" src="/img/foo_age_chart.png"
                            alt="Foo chart" />
                    </div>
                </template>
            </UCard>
        </div>
        <div v-else class="h-full flex items-center justify-center">
            <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Sport not found.</p>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import sports from '~/data/sports.json';
import athletes from '~/data/athletes.json';
import events from '~/data/events.json';
import countries from '~/data/countries.json';

definePageMeta({
    middleware: ['sport', 'previous', 'breadcrumb'],
    layout: 'canvas'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('sport').value;
const showSportPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showSportPage.value = true, 4200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const sport = sports[slug as keyof typeof sports];
let sportEvents: any[] = [];
if (sport) {
    for (const eventSlug of sport.events) {
        sportEvents.push(events[eventSlug as keyof typeof events]);
    }
}

let sportAthletes: any[] = [];
if (sport) {
    for (const athleteSlug of sport.athletes) {
        const athlete = athletes[athleteSlug as keyof typeof athletes] as any;
        const countrySlug = athlete["country"];
        athlete["countryObj"] = countries[countrySlug as keyof typeof countries];
        sportAthletes.push(athlete);
    }
}
const compactEvents = computed(() => sportEvents.slice(0, 3));
const compactAthletes = computed(() => sortByMedals(sportAthletes).slice(0, 3));


// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previousPage = useState('previous');
const transition = computed(() => previousPage.value && previousPage.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showSportPage.value = false;
    router.push('/');
}

// UI STATE ------------------------
const selected = ref(0);
const previous = ref(0);
const transitioning = ref(false);
const isSmallScreen = ref(false);
const eventCardHovered = ref(false);
const athleteCardHovered = ref(false);
const ageCardHovered = ref(false);


onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const toggleCard = (index: number = 0) => {
    eventCardHovered.value = false;
    athleteCardHovered.value = false;
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

const eventsExpandable = computed(() => Object.keys(sport.events).length > compactEvents.value.length);

useHead(() => {
    if (sport === undefined) return;
    const sportName = sport.name;
    const eventCount = Object.keys(sport.events)?.length || 0;
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
</script>