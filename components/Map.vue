<template>
    <div ref="mapContainer" :class="['flex-1 relative overflow-hidden', { 'pointer-events-none': introPlaying }]"></div>

    <button ref="searchButton" v-show="showSearchButton" @click="searchButtonClicked"
        class="absolute flex items-center top-10 left-1/2 transform -translate-x-1/2 text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 px-4 py-2 rounded-lg shadow-sm backdrop-blur-3xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700 transition-all duration-200 ease-in">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 mr-2">
            <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd" />
        </svg>
        athlete / sport / venue...
        <UKbd value="meta" size="sm" class="ml-2 mr-1 text-zinc-500 dark:text-zinc-400 bg-transparent"></UKbd>
        <UKbd value="K" size="sm" class="text-zinc-500 dark:text-zinc-400 bg-transparent">K</UKbd>
    </button>
    <UModal v-model:open="open"
        class="w-[20%] h-auto bg-opacity-0 backdrop-blur-3xl text-zinc-500 dark:text-zinc-400 rounded-xl"
        :ui="{ content: 'ring-zinc-300 dark:ring-zinc-600' }">
        <template #content>
            <UCommandPalette :groups="groups" placeholder="athlete / sport / venue..."
                :ui="{ root: 'divide-zinc-300 dark:divide-zinc-600', viewport: 'divide-zinc-300 dark:divide-zinc-600',  itemLeadingAvatar: 'dark:invert brightness-80' }" />
        </template>
    </UModal>
    <button ref="skipButton" v-show="showSkipButton" @click="skipIntro"
        class="absolute bottom-30 left-1/2 transform -translate-x-1/2 text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 px-4 py-2 rounded-lg shadow-sm backdrop-blur-3xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700">
        skip intro
    </button>
    <div ref="textContainer" v-if="showText"
        class="text absolute top-10 left-1/2 transform -translate-x-1/2 text-zinc-900 dark:text-gray-100 p-4 text-center"
        style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%)}">
        {{ currentText }}
    </div>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, { type EasingOptions, type MapOptions, type Marker } from 'mapbox-gl';

import { playIntro } from "~/utils/intro";
import { setFinalProperties, setMarkers, updateOutMarkers } from '~/utils/map';
import { displayButton, hideButton } from '~/utils/animations';
import { start, paris } from '~/utils/constants';

const open = ref(false);
const router = useRouter();
const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}
const intro = config.public.INTRO || '';

// REFS ------------------------------------------------------------------------------------------------------------- //
const mapContainer = ref<HTMLElement | null>(null);
const textContainer = ref<HTMLElement | null>(null);
const showText = ref<boolean>(false);
const currentText = ref<string>('');
const introPlaying = ref<boolean>(false);
const skipButton = ref<HTMLElement | null>(null);
const showSkipButton = ref<boolean>(false);
const searchButton = ref<HTMLElement | null>(null);
const showSearchButton = ref<boolean>(false);
const groups = ref<any[]>([]);


// SKIP INTRO LOGIC ------------------------------------------------------------------------------------------------- //
const controller = new AbortController();
const { signal } = controller;
const skipIntro = async () => {
    controller.abort();
    introPlaying.value = false;
    showText.value = false;
    await new Promise<void>((resolve) => {
        map.flyTo({
            ...paris,
            duration: 2000,
            essential: true,
            curve: 1,
        } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => { });
    setFinalProperties(map);
    await setMarkers(map, router);
};

// SKIP BUTTON LOGIC ------------------------------------------------------------------------------------------------ //
watch(introPlaying, async (newVal) => {
    if (newVal) {
        displayButton(showSkipButton, skipButton, 3, 2);
        hideButton(showSearchButton, searchButton, 1);
    } else {
        hideButton(showSkipButton, skipButton, 1);
        displayButton(showSearchButton, searchButton, 2, 1);
    }
});

// SEARCH BUTTON LOGIC ---------------------------------------------------------------------------------------------- //
defineShortcuts({
    meta_k: () => {
        open.value = true;
    },
    escape: () => {
        open.value = false;
    }
})
watch(open, async (newVal) => {
    if (newVal) {
        hideButton(showSearchButton, searchButton, 0)
    } else {
        displayButton(showSearchButton, searchButton, 0, 0.2)
    }
})
const searchButtonClicked = () => {
    open.value = true;
    hideButton(showSearchButton, searchButton, 0)
}

// COLOR SCHEME ----------------------------------------------------------------------------------------------------- //
const style = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
});

let map: mapboxgl.Map;
let venues: { [key: string]: any };
let sports: { [key: string]: any };
let athletes: { [key: string]: any };
let outMarkers = new Map<Marker, Marker>();
let lastZoom: number = 0;

// HANDLE DIRECT ACCESS  -------------------------------------------------------------------------------------------- //
const directVenueAccess = useState('venue');
const directSportAccess = useState('sport');
const directAthleteAccess = useState('athlete');
let directAccess: boolean = false;

onMounted(async () => {
    if (!isClient) return;

    // FETCH DATA --------------------------------------------------------------------------------------------------- //
    venues = await fetch('/data/venues.json').then((res) => res.json());
    sports = await fetch('/data/sports.json').then((res) => res.json());
    athletes = await fetch('/data/athletes.json').then((res) => res.json());

    // COMMAND PALETTE ---------------------------------------------------------------------------------------------- //
    groups.value.push({
        id: "venues",
        label: "Venues",
        items: Object.keys(venues).map(key => {
            let venue = venues[key];
            return {
                label: venue.name,
                avatar: {
                    src: venue.img
                }
            }
        })
    })
    groups.value.push({
        id: "sports",
        label: "Sports",
        items: Object.keys(sports).map(key => {
            let sport = sports[key];
            return {
                label: sport.name,
                avatar: {
                    src: sport.icon
                }
            }
        })
    })

    // HANDLE DIRECT ACCESS ----------------------------------------------------------------------------------------- //
    let venueCoordinates = [] as number[];
    if (directVenueAccess.value) {
        directAccess = true;
        const venue = venues[directVenueAccess.value as string];
        venueCoordinates = [venue.location.longitude, venue.location.latitude];
    } else if (directSportAccess.value) {
        directAccess = true;
        const sport = sports[directSportAccess.value as string];
        const venue = venues[sport["venues"][0]["slug"] as string];
        venueCoordinates = [venue.location.longitude, venue.location.latitude];
    } else if (directAthleteAccess.value) {
        directAccess = true;
        const athlete = athletes[directAthleteAccess.value as string];
        const sport = sports[athlete["sports"][0]["slug"] as string]
        const venue = venues[sport["venues"][0]["slug"] as string];
        venueCoordinates = [venue.location.longitude, venue.location.latitude];
    }

    // CREATE MAP --------------------------------------------------------------------------------------------------- //
    if (intro || directAccess) {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: style.value,
            maxZoom: 16,
            dragRotate: false,
            ...start
        } as MapOptions);
    } else {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: style.value,
            maxZoom: 16,
            minZoom: 10,
            dragRotate: false,
            maxBounds: [
                [2.0575, 48.0000],
                [3.0079, 49.9999]
            ],
            ...paris,
        } as MapOptions);
    }

    map.on('style.load', async () => {

        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        map.style.stylesheet.layers.forEach((layer) => {
            if (layer.type === 'symbol') {
                map.removeLayer(layer.id);
            }
        });

        // ADD 3D BUILDINGS LAYER ----------------------------------------------------------------------------------- //
        map.addLayer(
            {
                id: 'add-3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 14.95,
                paint: {
                    'fill-extrusion-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#ff0000',
                        '#aaa'
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'min_height'],
                    'fill-extrusion-opacity': 0.6
                }
            },
        );

        // COLOR SPECIFIC BUILDINGS --------------------------------------------------------------------------------- //
        Object.keys(venues).forEach(key => {
            venues[key].buildingIds.forEach((id: number) => {
                map.setFeatureState(
                    { source: 'composite', sourceLayer: 'building', id },
                    { selected: true }
                );
            });
        });

        // PLAY INTRO ANIMATION ------------------------------------------------------------------------------------- //
        if (intro && !directAccess) {
            introPlaying.value = true;
            await playIntro(map, signal, showText, textContainer, currentText);
            introPlaying.value = false;
        } else if (directAccess) {
            await new Promise<void>(async (resolve, reject) => {
                if (signal.aborted) return reject();
                map.flyTo({ center: venueCoordinates, zoom: 15.5, bearing: 0, pitch: 55, duration: 4000, essential: true, curve: 1 } as EasingOptions);
                map.once('moveend', () => resolve());
            }).catch(() => { });
        }
        if (!intro) {
            displayButton(showSearchButton, searchButton, 1, 1)
        }

        // SET FINAL PROPERTIES & ADD MARKERS ----------------------------------------------------------------------- //
        setFinalProperties(map);
        await setMarkers(map, router);
    });

    // OUT MARKERS UPDATE LOGIC ------------------------------------------------------------------------------------- //
    map.on('move', () => {
        const zoom = map.getZoom()
        updateOutMarkers(map, outMarkers, zoom, lastZoom);
        lastZoom = zoom;
    })

    // MAKE COLOR MODE REACTIVE ------------------------------------------------------------------------------------- //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (map) {
            map.setStyle(style.value);
        }
    });
});

onUnmounted(() => {
    if (isClient && map) {
        map.remove();
    }
});


</script>
