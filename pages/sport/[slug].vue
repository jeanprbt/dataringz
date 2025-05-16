<template>
    <PageModal :show="showSportPage" :back="transition" :transition="transition" :items="items" @close="closePage"
        @back="router.back()">

        <div :class="['gap-4 p-2 h-full', { 'grid grid-cols-12 grid-rows-6': selected === 0 }]">


            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-4 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1': selected === 0,
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
                'col-span-8 md:col-span-6 row-span-1 md:row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && isSmallScreen,
                'animate-bento-card': selected === 0 && transitioning && previous === 3,
                'transition-all duration-500 transform h-full': selected === 3,
                'hidden': selected !== 0 && selected !== 3
            }" @click="isSmallScreen ? selected === 3 ? () => { } : toggleCard(3) : () => { }">
                <template #default>
                    <div v-if="selected === 3 && isSmallScreen" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <D3GenderPieChart :sport-slug="slug" />
                    </div>
                    <div v-else-if="isSmallScreen" class="h-full relative flex items-center">
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Gender distribution
                        </h3>
                    </div>
                    <div v-else class="h-full">
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white">Gender distribution</h3>
                        <D3GenderPieChart :sport-slug="slug" />
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
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30': selected === 0 && !transitioning && eventsExpandable,
                'animate-bento-card': selected === 0 && transitioning && previous === 4,
                'transition-all duration-500 transform h-full': selected === 4,
                'hidden': selected !== 0 && selected !== 4
            }" @click="eventsExpandable && selected !== 4 && !eventHovered ? toggleCard(4) : () => { }"
                @mouseenter="eventCardHovered = true" @mouseleave="eventCardHovered = false">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 4" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCardAndSelectEvent(4, null)" />

                        <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">

                            <!-- selected event -->
                            <div v-if="selectedEvent" class="h-full relative">
                                <UButton v-if="eventsExpandable" variant="ghost" icon="i-heroicons-arrow-left"
                                    class="absolute left-0" @click.stop="selectedEvent = null" />
                                <div class="flex flex-col items-center justify-center h-full">
                                    <h3 class="font-medium text-zinc-500 dark:text-zinc-400 mb-5">{{ sport.name }} | {{
                                        selectedEvent.name }}</h3>
                                    <D3Tournament :matches="selectedEvent.matches" />
                                </div>
                            </div>

                            <!-- list of events -->
                            <div v-else class="flex flex-col h-full">
                                <h3 class="col-span-full text-lg font-medium text-zinc-800 dark:text-white mb-4">Events
                                </h3>
                                <div
                                    class="grid [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))] gap-4 h-full">
                                    <p v-for="([event_name, event], index) in Object.entries(sport.events)" :key="index"
                                        :class="[
                                            'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                            { 'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50': event.tournament }
                                        ]" @click.stop="event.tournament ? selectEvent(event) : () => { }">
                                        {{ event_name }}
                                    </p>
                                </div>
                            </div>
                        </transition>

                    </div>

                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="eventCardHovered && eventsExpandable" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <div class="flex flex-col justify-center h-full">
                            <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white mb-2">Events</h3>
                            <div class="grid [grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))] gap-3 h-full">
                                <p v-for="([event_name, event], index) in compactEvents" :key="index"
                                    @mouseenter="hoverEvent()" @mouseleave="unhoverEvent()"
                                    @click="event.tournament ? toggleCardAndSelectEvent(4, event) : () => { }" :class="[
                                        'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                        { 'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50': event.tournament }
                                    ]">
                                    {{ event_name }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-6 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-3': selected === 0,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 5,
                'transition-all duration-500 transform h-full': selected === 5,
                'hidden': selected !== 0 && selected !== 5
            }" @click="selected !== 5 && !athleteHovered ? toggleCard(5) : () => { }"
                @mouseenter="athleteCardHovered = true" @mouseleave="athleteCardHovered = false">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 5" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCard(5)" />

                        <div class="flex flex-col h-full">
                            <h3 class="col-span-full text-lg font-medium text-zinc-800 dark:text-white mb-4">Medallists
                            </h3>

                            <div class="grid [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))] gap-4 h-full">
                                <NuxtLink v-for="athlete in sport.athletes" :key="athlete.slug"
                                    :to="`/athlete/${athlete.slug}`"
                                    class="flex flex-col items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50 p-2">
                                    <span
                                        class="text-center text-xs md:text-sm font-medium text-zinc-800 dark:text-white">
                                        {{ athlete.name }}
                                    </span>
                                    <div v-if="athlete.country" class="flex items-center mt-1">
                                        <CountryFlag v-if="athlete.countryCode" :code="athlete.countryCode"
                                            :name="athlete.country" size="sm" class="mr-1" />
                                        <span class="text-xs text-gray-500 dark:text-gray-400">{{
                                            athlete.country }}</span>
                                    </div>
                                    <MedalDisplay :medals="athlete.medals" class="mt-2" />
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="athleteCardHovered" name="i-heroicons-arrow-up-right"
                                class="absolute right-0" />
                        </transition>
                        <div class="flex flex-col justify-center h-full">
                            <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white mb-2">Medallists
                            </h3>
                            <div class="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                                <NuxtLink v-for="athlete in compactAthletes" :key="athlete.slug"
                                    @mouseenter="hoverAthlete()" @mouseleave="unhoverAthlete()"
                                    :to="`/athlete/${athlete.slug}`"
                                    class="flex flex-col items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50 p-2">
                                    <span
                                        class="text-center text-xs md:text-sm font-medium text-zinc-800 dark:text-white">
                                        {{ athlete.name }}
                                    </span>
                                    <div v-if="athlete.country" class="flex items-center mt-1">
                                        <CountryFlag v-if="athlete.countryCode" :code="athlete.countryCode"
                                            :name="athlete.country" size="sm" class="mr-1" />
                                        <span class="text-xs text-gray-500 dark:text-gray-400">{{
                                            athlete.country }}</span>
                                    </div>
                                    <MedalDisplay :medals="athlete.medals" class="mt-2" />
                                </NuxtLink>
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
            }" @click="selected === 6 ? () => { } : toggleCard(6)">
                <template #default>
                    <div v-if="selected === 6" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(6)" />
                        <D3AgeHistogram :sport-slug="sport.slug" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Age distribution</h3>
                        <img v-if="!isSmallScreen" class="w-full h-full p-12" src="/img/foo_age_chart.png"
                            alt="Foo chart" />
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
type EventType = { [key: string]: any };
const selectedEvent = ref<EventType | null>(null);
const eventHovered = ref(false);
const eventCardHovered = ref(false);
const athleteHovered = ref(false);
const athleteCardHovered = ref(false);

onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const toggleCard = (index: number = 0) => {
    eventHovered.value = false;
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

const selectEvent = (event: any) => selectedEvent.value = event;
const toggleCardAndSelectEvent = (index: number, event: any) => {
    selectEvent(event);
    toggleCard(index);
}


const hoverEvent = () => {
    eventCardHovered.value = false;
    eventHovered.value = true;
}
const unhoverEvent = () => {
    eventCardHovered.value = true;
    eventHovered.value = false;
}
const hoverAthlete = () => {
    athleteCardHovered.value = false;
    athleteHovered.value = true;
}
const unhoverAthlete = () => {
    athleteCardHovered.value = true;
    athleteHovered.value = false;
}
const compactEvents = computed(() => Object.entries(sport.events).slice(0, 6));
const compactAthletes = computed(() => sortByMedals(sport.athletes).slice(0, 4));
const eventsExpandable = computed(() => Object.keys(sport.events).length > compactEvents.value.length);

useHead(() => {
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