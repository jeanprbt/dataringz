<template>
    <div class="absolute flex top-5 left-1/2 transform -translate-x-1/2">
        <button ref="olympicsButton" @click="router.push('/olympics')" v-show="showOlympicsButton"
            class="flex items-center justify-center mr-2 px-1 rounded-lg shadow-sm backdrop-blur-2xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700 w-[50px] h-[40px]">
             <img src="/img/olympics.svg" alt="olympics logo" class="size-9"/>
        </button>
        <button ref="searchButton" @click="searchButtonClicked" v-show="showSearchButton"
            class="flex items-center text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 px-4 py-2 rounded-lg shadow-sm backdrop-blur-2xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 mr-2">
                <path fill-rule="evenodd"
                    d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                    clip-rule="evenodd" />
            </svg>
            {{ searchBarText }}
            <UKbd v-if="!isSmallScreen" value="meta" size="sm" class="ml-2 mr-1 text-zinc-500 dark:text-zinc-400 bg-transparent"></UKbd>
            <UKbd v-if="!isSmallScreen" value="K" size="sm" class="text-zinc-500 dark:text-zinc-400 bg-transparent">K</UKbd>
        </button>
        <button ref="globeButton" @click="globeButtonClicked" v-show="showGlobeButton"
            class="text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 ml-2 px-2 pt-1 rounded-lg shadow-sm backdrop-blur-2xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700">
            <UIcon :name="globeIcon" class="size-7" />
        </button> 
    </div>
    <UModal v-model:open="open" class="w-[80%] md:w-[35%] h-auto bg-opacity-0 backdrop-blur-3xl rounded-xl"
        :overlay="false" :ui="{ content: 'ring-zinc-300 dark:ring-zinc-600' }">
        <template #content>
            <UCommandPalette :groups="groups" :placeholder="searchBarText" @highlight="onHighlight"
                :ui="{ root: 'divide-zinc-300 dark:divide-zinc-600', label: 'text-zinc-500 dark:text-zinc-400', itemLabelBase: 'text-zinc-500 dark:text-zinc-400', viewport: 'divide-zinc-300 dark:divide-zinc-600', itemLeadingAvatar: section === 'globe' ? 'bg-transparent' : 'bg-transparent dark:invert brightness-100' }">
            </UCommandPalette>
        </template>
    </UModal>
    <div ref="tooltipRef"
        class="absolute bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white p-2 rounded shadow pointer-events-none hidden">
    </div>
</template>

<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui';

import venues from '~/data/venues.json';
import sports from '~/data/sports.json';
import athletes from '~/data/athletes.json';
import countries from '~/data/countries.json';

definePageMeta({
    middleware: ["breadcrumb"],
    layout: 'canvas'
});

// COMPOSABLES ------------------------------------------------------------------------------------------------------ //
const router = useRouter();
const { canvas } = useCanvas();
const { intro, introPlaying } = useIntro();
const { section, setSection } = useSection();

// UI STATE --------------------------------------------------------------------------------------------------------- //
const tooltipRef = ref<HTMLElement | null>(null);
const searchBarText = section.value === 'map' ? ref('athlete / sport / venue') : ref('country');
const globeIcon = section.value === 'map' ? ref('i-heroicons-globe-europe-africa') : ref('mingcute:eiffel-tower-line');

// COMMAND PALETTE -------------------------------------------------------------------------------------------------- //
const groups = ref<any[]>([]);
let flying = false;
const getMapItems = (map: mapboxgl.Map) => {
    const res = [];
    res.push({
        id: "venues",
        label: "Venues",
        items: Object.keys(venues).map(key => {
            let venue = venues[key as keyof typeof venues];
            return {
                label: venue.name,
                avatar: {
                    src: venue.img
                },
                async onSelect() {
                    open.value = false;
                    const coordinates = [venue.location.longitude, venue.location.latitude] as [number, number];
                    flying = true;
                    await flyToVenue(map, coordinates);
                    flying = false;
                    router.push(`/venue/${venue.slug}`);
                }
            }
        })
    })
    res.push({
        id: "sports",
        label: "Sports",
        items: Object.keys(sports).map(key => {
            let sport = sports[key as keyof typeof sports];
            return {
                label: sport.name,
                avatar: {
                    src: sport.icon
                },
                async onSelect() {
                    open.value = false;
                    const venue = venues[sport["venues"][0]["slug"] as keyof typeof venues];
                    const coordinates = [venue.location.longitude, venue.location.latitude] as [number, number];
                    flying = true;
                    await flyToVenue(map, coordinates);
                    flying = false;
                    router.push(`/sport/${sport.slug}`);
                }
            }
        })
    })
    res.push({
        id: "athletes",
        label: "Athletes",
        items: Object.keys(athletes).map(key => {
            let athlete = athletes[key as keyof typeof athletes] as any;
            return {
                label: athlete.name,
                async onSelect() {
                    open.value = false;
                    const sport = sports[athlete["sports"][0]["slug"] as keyof typeof sports]
                    const venue = venues[sport["venues"][0]["slug"] as keyof typeof venues];
                    const coordinates = [venue.location.longitude, venue.location.latitude] as [number, number];
                    flying = true;
                    await flyToVenue(map, coordinates);
                    flying = false;
                    router.push(`/athlete/${athlete.slug}`);
                }
            }
        })
    })
    return res;
}

const getGlobeItems = (globe: mapboxgl.Map) => {
    const res = [];
    res.push({
        id: "countries",
        label: "Countries",
        items: Object.keys(countries).map(key => {
            let country = countries[key as keyof typeof countries];
            return {
                label: country.name,
                avatar: {
                    src: country.img
                },
                async onSelect() {
                    open.value = false;
                    const coordinates = [country.location.longitude, country.location.latitude] as [number, number];
                    flying = true;
                    await flyToCountry(globe, coordinates);
                    flying = false;
                    router.push(`/country/${country.slug}`);
                }
            }
        })
    })
    return res;
}

// ITEMS & SEARCH BAR UPDATE LOGIC ---------------------------------------------------------------------------------- //
if (canvas.value) {
    // @ts-ignore
    groups.value = section.value === 'map' ? getMapItems(canvas.value) : getGlobeItems(canvas.value);
}
else {
    watch(canvas, (newCanvas) => {
        if (newCanvas) {
            // @ts-ignore 
            groups.value = section.value === 'map' ? getMapItems(canvas.value) : getGlobeItems(canvas.value);
        }
    })
}

// COMMAND PALETTE HIGHLIGHT LOGIC ---------------------------------------------------------------------------------- //
const highlightedElem = ref<HTMLElement | null>(null);
const onHighlight = (payload: { ref: HTMLElement, value: CommandPaletteItem } | undefined) => {
    if (highlightedElem.value !== null) {
        highlightedElem.value!.classList.remove('bg-zinc-200');
        highlightedElem.value!.classList.remove('dark:bg-zinc-700')
    }
    highlightedElem.value = payload!.ref
    payload!.ref.classList.add('bg-zinc-200');
    payload!.ref.classList.add('dark:bg-zinc-700');
    payload!.ref.classList.add('rounded-lg');
}

// BUTTONS LOGIC ---------------------------------------------------------------------------------------------------- //
const open = ref(false);
const searchButton = ref<HTMLElement | null>(null);
const showSearchButton = ref<boolean>(false);
const globeButton = ref<HTMLElement | null>(null);
const showGlobeButton = ref<boolean>(false);
const olympicsButton = ref<HTMLElement | null>(null);
const showOlympicsButton = ref<boolean>(false);
const isSmallScreen = ref(false);

const searchButtonClicked = () => {
    open.value = true;
    hideButton(showSearchButton, searchButton, 0)
    hideButton(showGlobeButton, globeButton, 0)
    hideButton(showOlympicsButton, olympicsButton, 0)
}
const globeButtonClicked = async () => {
    if (section.value === 'map') {
        removeMarkers();
        hideButton(showSearchButton, searchButton, 0.5);
        hideButton(showGlobeButton, globeButton, 0.5);
        hideButton(showOlympicsButton, olympicsButton, 0.5);

        // @ts-ignore
        unsettleMapCanvas(canvas.value);

        await new Promise<void>(async (resolve): Promise<void> => {
            // globe view
            canvas.value!.flyTo({
                center: [2.209667, 46.232193],
                zoom: 2,
                bearing: 0,
                pitch: 0,
                duration: 4000,
                essential: true,
                curve: 1
            });
            canvas.value!.once('moveend', () => resolve());
        }).catch(() => { });
        setSection('globe');

        // @ts-ignore
        groups.value = getGlobeItems(canvas.value);
        searchBarText.value = 'country';
        globeIcon.value = 'mingcute:eiffel-tower-line';

        // @ts-ignore
        settleGlobeCanvas(canvas.value, tooltipRef, router)
        displayButton(showSearchButton, searchButton, 0.5, 0.5);
        displayButton(showGlobeButton, globeButton, 0.5, 0.5);
        displayButton(showOlympicsButton, olympicsButton, 0.5, 0.5);
    } else if (section.value === 'globe') {
        hideButton(showSearchButton, searchButton, 0.5);
        hideButton(showGlobeButton, globeButton, 0.5);
        hideButton(showOlympicsButton, olympicsButton, 0.5);

        // @ts-ignore
        unsettleGlobeCanvas(canvas.value);

        await new Promise<void>(async (resolve): Promise<void> => {
            // paris view
            canvas.value!.flyTo({
                center: [2.294694, 48.858093],
                zoom: 15.5,
                pitch: 55,
                bearing: 0,
                duration: 4000,
                essential: true,
                curve: 1
            });
            canvas.value!.once('moveend', () => resolve());
        }).catch(() => { });
        setSection('map');

        // @ts-ignore
        groups.value = getMapItems(canvas.value);
        searchBarText.value = 'athlete / sport / venue';
        globeIcon.value = 'i-heroicons-globe-europe-africa';


        // @ts-ignore
        settleMapCanvas(canvas.value);
        displayButton(showSearchButton, searchButton, 0.5, 0.5);
        displayButton(showGlobeButton, globeButton, 0.5, 0.5);
        displayButton(showOlympicsButton, olympicsButton, 0.5, 0.5);
        addMarkers();
    }
}

defineShortcuts({
    meta_k: searchButtonClicked,
    escape: () => {
        open.value = false;
    }
})
watch(open, (newVal) => {
    if (newVal) {
        hideButton(showSearchButton, searchButton, 0);
        hideButton(showGlobeButton, globeButton, 0);
        hideButton(showOlympicsButton, olympicsButton, 0);
    } else if (!flying) {
        displayButton(showSearchButton, searchButton, 0.2, 0.5);
        displayButton(showGlobeButton, globeButton, 0.2, 0.5);
        displayButton(showOlympicsButton, olympicsButton, 0.2, 0.5);
    }
})
watch(introPlaying, (newVal) => {
    if (newVal) {
        hideButton(showSearchButton, searchButton, 1);
        hideButton(showGlobeButton, globeButton, 1);
        hideButton(showOlympicsButton, olympicsButton, 1);
    } else {
        displayButton(showSearchButton, searchButton, 2, 1);
        displayButton(showGlobeButton, globeButton, 2, 1);
        displayButton(showOlympicsButton, olympicsButton, 2, 1);
    }
});

onMounted(() => {
    if (!intro.value) {
        displayButton(showSearchButton, searchButton, 0, 0.8);
        displayButton(showGlobeButton, globeButton, 0, 0.8);
        displayButton(showOlympicsButton, olympicsButton, 0, 0.8);
    }

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);

    // @ts-ignore
    setTooltipRef(tooltipRef);
})

</script>