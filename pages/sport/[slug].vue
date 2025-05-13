<template>
    <PageModal :show="showSportPage" :back="transition" :transition="transition" :items="items" @close="closePage"
        @back="router.back()">

        <div :class="['gap-4 p-2 h-full', { 'grid grid-cols-12 grid-rows-6': selected === 0 }]">

            <UCard variant="soft" :ui="{ 'body': 'p-2 sm:p-6 h-full' }" :class="{
                'col-span-4 md:col-span-2 row-span-1 md:row-span-2': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <img class="w-full h-full dark:filter dark:invert dark:brightness-90"
                        :src="`/img/sports/SVG/${slug}.svg`" :alt="`Icon of ${sport.name}`" />
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-4 h-full' }" :class="{
                'col-span-8 md:col-span-4 row-span-1': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex flex-col justify-center h-full">
                        <h3 class="text-sm md:text-lg font-medium text-zinc-800 dark:text-white">{{ sport.name }}</h3>
                        <p v-if="sport.description" class="text-xs md:text-sm text-zinc-600 dark:text-gray-300">{{
                            sport.description }}</p>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-6 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 3,
                'transition-all duration-500 transform h-full': selected === 3,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <div v-if="selected === 3 && isSmallScreen" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <D3GenderPieChart :sport-slug="slug" />
                    </div>
                    <div v-else-if="isSmallScreen" class="h-full relative flex items-center">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-out" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Gender distribution</h3>
                    </div>
                    <div v-else class="h-full">
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Gender distribution</h3>
                        <D3GenderPieChart :sport-slug="slug" />
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-3 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-4 row-span-1': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 4,
                'transition-all duration-500 transform h-full': selected === 4,
                'hidden': selected !== 0 && selected !== 4
            }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 4" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(4)" />
                        <div class="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4">
                            <h3 class="col-span-full text-lg font-medium text-zinc-800 dark:text-white mb-1">Events</h3>
                            <p v-for="(event, index) in sport.events" :key="index"
                                class="text-sm text-zinc-600 dark:text-gray-300 rounded-lg p-2 bg-zinc-100 dark:bg-zinc-900 whitespace-nowrap">
                                {{ event }}
                            </p>
                        </div>

                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <UButton v-if="sport.events.length > compactEvents.length" variant="ghost"
                            icon="i-heroicons-arrows-pointing-out" @click="toggleCard(4)" class="absolute right-0">
                        </UButton>
                        <div class="flex flex-col justify-center ">
                            <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white mb-1">Events</h3>
                            <div class="flex justify-left gap-2">
                                <p v-for="(event, index) in compactEvents" :key="index"
                                    class="text-sm text-zinc-600 dark:text-gray-300 rounded-lg p-2 bg-zinc-100 dark:bg-zinc-900">
                                    {{ event }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <div :class="{
                'col-span-12 md:col-span-6 row-span-4 grid grid-cols-2 grid-rows-2 gap-4 h-full': true,
                'hidden': selected !== 0
            }">
                <UCard v-for="athlete in compactAthletes" :key="athlete.slug" variant="soft"
                    :ui="{ 'body': 'p-0 md:p-4 h-full' }" :class="{
                        'col-span-1 row-span-1': selected === 0,
                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    }">
                    <template #default>
                        <NuxtLink :to="`/athlete/${athlete.slug}`"
                            class=" w-full h-full flex flex-col items-center justify-center">
                            <div class="mb-2">
                                <AthletePicture :name="athlete.name" :slug="slug" size="sm" />
                            </div>
                            <span class="text-center text-sm font-medium text-zinc-800 dark:text-white">
                                {{ athlete.name }}
                            </span>
                            <div v-if="athlete.country" class="flex items-center mt-1">
                                <CountryFlag v-if="athlete.countryCode" :code="athlete.countryCode"
                                    :name="athlete.country" size="sm" class="mr-1" />
                                <span class="text-xs text-gray-500 dark:text-gray-400">{{ athlete.country }}</span>
                            </div>
                            <MedalDisplay :medals="athlete.medals" class="mt-2" />
                        </NuxtLink>
                    </template>
                </UCard>
            </div>

            <UCard variant="soft" :ui="{ 'body': 'p-6 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 6,
                'transition-all duration-500 transform h-full': selected === 6,
                'hidden': selected !== 0 && selected !== 6
            }">
                <template #default>
                    <div v-if="selected === 6" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(6)" />
                        <D3AgeHistogram :sport-slug="sport.slug" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-out" class="absolute right-0"
                            @click.stop="toggleCard(6)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Age distribution</h3>
                        <img v-if="!isSmallScreen " class="w-full h-full p-12"
                            src="/img/foo_age_chart.png" alt="Foo chart" />
                    </div>
                </template>
            </UCard>


        </div>
    </PageModal>
</template>

<script setup lang="ts">
import sports from '~/data/sports.json';

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

onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const toggleCard = (index: number = 0) => {
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
const compactEvents = computed(() => {
    const maxEvents = 3;
    const maxTotalChars = 35;
    let totalChars = 0;
    let result = [];
    const sortedEvents = [...sport.events].sort((a, b) => a.length - b.length);
    for (const event of sortedEvents) {
        if (result.length >= maxEvents) break;
        totalChars += event.length;
        if (totalChars > maxTotalChars && result.length > 0) break;
        result.push(event);
    }
    return result;
});
const compactAthletes = computed(() => sortByMedals(sport.athletes).slice(0, 4))

useHead(() => {
    const sportName = sport.name;
    const eventCount = sport.events?.length || 0;
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