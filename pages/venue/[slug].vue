<template>
    <PageModal :show="showVenuePage" :transition="transition" :items="items" @close="closePage" @back="router.back()">
        <div v-if="venue"
            :class="['gap-4 p-2 h-full flex flex-col overflow-y-auto', { 'md:grid md:grid-cols-12 md:grid-rows-12 md:overflow-hidden': selected === 0 }]">
            <UCard variant="soft" :ui="{ 'body': 'p-0 sm:p-0 h-full' }" :class="{
                'col-span-12 md:col-span-8 row-span-4 md:row-span-8 flex-shrink-0 h-64 md:h-auto': selected === 0,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <img :src="`/img/venues/${venue.slug}.jpg`" :alt="venue.name"
                        class="w-full h-full rounded-lg shadow-lg object-cover" />
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-4 h-full' }" :class="{
                'col-span-12 md:col-span-4 row-span-2 flex-shrink-0': selected === 0,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex flex-col h-full justify-center">
                        <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">{{ venue.name }}</h2>
                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">{{ venue.description }}</p>
                    </div>
                </template>
            </UCard>

            <div class="grid grid-cols-2 gap-4 md:contents">
                <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-4 h-full' }" :class="{
                    'md:col-span-2 md:row-span-2 flex-shrink-0': selected === 0,
                    'hidden': selected !== 0 && selected !== 3
                }">
                    <template #default>
                        <div class="flex flex-col h-full justify-center">
                            <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">Start</h2>
                            <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">{{ dateStart }}</p>
                        </div>
                    </template>
                </UCard>

                <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-4 h-full' }" :class="{
                    'md:col-span-2 md:row-span-2 flex-shrink-0': selected === 0,
                    'hidden': selected !== 0 && selected !== 3
                }">
                    <template #default>
                        <div class="flex flex-col h-full justify-center">
                            <h2 class="text-base md:text-xl font-bold text-zinc-800 dark:text-white">End</h2>
                            <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">{{ dateEnd }}</p>
                        </div>
                    </template>
                </UCard>
            </div>

            <UCard variant="soft" :ui="{ 'body': 'p-0 sm:p-0 h-full' }" :class="{
                'col-span-12 md:col-span-4 row-span-4 flex-shrink-0 h-32 md:h-auto': selected === 0,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <div ref="smallMapContainer" class="w-full h-full rounded-lg"></div>
                </template>
            </UCard>

            <div class="grid grid-cols-2 gap-4 md:contents">
                <UCard v-for="sport in venueSports" :key="sport.slug" variant="soft"
                    :ui="{ 'body': 'p-0 sm:p-0 h-full' }" :class="{
                        'col-span-12 md:col-span-12': venueSports.length === 1 && selected === 0,
                        'col-span-12 md:col-span-6': venueSports.length === 2 && selected === 0,
                        'col-span-6 md:col-span-4': venueSports.length === 3 && selected === 0,
                        'col-span-6 md:col-span-3': venueSports.length >= 4 && selected === 0,
                        'row-span-2 md:row-span-4': selected === 0,
                        'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                        'hidden': selected !== 0 && selected !== 3,
                        'flex-shrink-0 h-32 md:h-auto': true
                    }">
                    <template #default>
                        <NuxtLink :to="`/sport/${sport.slug}`"
                            class="w-full h-full flex flex-col items-center justify-center p-4">
                            <img :src="`/img/sports/SVG/${sport.slug}.svg`" :alt="sport.name"
                                class="w-12 h-12 mb-2 dark:filter dark:invert dark:brightness-90" />
                            <span class="text-center text-sm font-medium text-zinc-800 dark:text-white">
                                {{ sport.name }}
                            </span>
                        </NuxtLink>
                    </template>
                </UCard>
            </div>
        </div>
        <div v-else class="h-full flex items-center justify-center">
            <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Venue not found.</p>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';

import venues from '~/data/venues.json';
import sports from '~/data/sports.json';

definePageMeta({
    middleware: ['venue', 'previous', 'breadcrumb'],
    layout: 'canvas'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('venue').value;
const showVenuePage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showVenuePage.value = true, 4200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const venue = venues[slug as keyof typeof venues];
let venueSports: any[] = [];
if (venue) {
    for (const sportSlug of venue.sports) {
        venueSports.push(sports[sportSlug as keyof typeof sports]);
    }
}

// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previousCard = useState('previous');
const transition = computed(() => previousCard.value && previousCard.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showVenuePage.value = false;
    router.push('/');
}

// UI STATE ------------------------
const selected = ref(0);
const transitioning = ref(false);
const dateStart = computed(() => formatDate(venue.date_start));
const dateEnd = computed(() => formatDate(venue.date_end));

// MAP -----------------------------
const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) { mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '' };
const smallMapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
    if (venue === undefined) return;
    if (smallMapContainer.value) {
        const map = new mapboxgl.Map({
            container: smallMapContainer.value as HTMLElement,
            style: 'mapbox://styles/mapbox/standard',
            center: [venue.location.longitude, venue?.location.latitude] as [number, number],
            zoom: 15,
            pitch: 50,
            bearing: 0,
            maxZoom: 16,
            minZoom: 14,
        });
        new mapboxgl.Marker({ color: 'red' })
            .setLngLat([venue.location.longitude, venue.location.latitude] as [number, number])
            .addTo(map)
    } else {
        watch(smallMapContainer, newValue => {
            const map = new mapboxgl.Map({
                container: newValue as HTMLElement,
                style: 'mapbox://styles/mapbox/standard',
                center: [venue.location.longitude, venue.location.latitude] as [number, number],
                zoom: 15,
                pitch: 50,
                bearing: 0,
                maxZoom: 16,
                minZoom: 14,
            });
            new mapboxgl.Marker({ color: 'red' })
                .setLngLat([venue.location.longitude, venue.location.latitude] as [number, number])
                .addTo(map)
        })
    }
});

useHead(() => {
    if (venue === undefined) return;
    const name = venue.name;
    const sports = venueSports && venueSports.length > 0
        ? venueSports.map((s: any) => s.name).join(', ')
        : 'Olympic sports';

    const title = `${name} - Olympic Venue | Paris 2024`;
    const description = `Explore ${name}, an Olympic venue for ${sports} at the Paris 2024 Olympic Games.`;

    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/venue/${slug}` },
            { property: 'og:type', content: 'website' },

            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ],
        link: [
            { rel: 'canonical', href: `https://dataringz.martinctl.dev/venue/${slug}` },
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        ]
    };
});
</script>