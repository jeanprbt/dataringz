<template>
    <div ref="mapContainer" :class="['flex-1 relative overflow-hidden', { 'pointer-events-none': introPlaying }]"></div>
    <button ref="skipButton" v-show="showSkipButton" @click="skipIntro"
        class="absolute bottom-30 left-1/2 transform -translate-x-1/2 text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 px-4 py-2 rounded-lg shadow-sm backdrop-blur-3xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700">
        skip intro
    </button>
    <div ref="textContainer" v-if="showText"
        class="text absolute top-10 left-1/2 transform -translate-x-1/2 text-zinc-900 dark:text-gray-100 p-4 text-center"
        style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%)">
        {{ currentText }}
    </div>
    <div ref="tooltipRef"
        class="absolute bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white p-2 rounded shadow pointer-events-none hidden">
    </div>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

import { playIntro } from "~/utils/intro";
import { settleMapCanvas, setMarkers, updateMarkers } from '~/utils/map';
import { displayButton, hideButton } from '~/utils/animations';

import venues from '~/data/venues.json';
import sports from '~/data/sports.json';
import athletes from '~/data/athletes.json';
import countries from '~/data/countries.json';

// COMPOSABLES ------------------------------------------------------------------------------------------------------ //
const router = useRouter();
const config = useRuntimeConfig();
const { setCanvas } = useCanvas();
const { intro, setIntro, introPlaying, setIntroPlaying } = useIntro();

// MAPBOX API & INTRO ----------------------------------------------------------------------------------------------- //
const isClient = import.meta.client;
if (isClient) { mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '' }
setIntro(config.public.INTRO || false);

// REFS ------------------------------------------------------------------------------------------------------------- //
const mapContainer = ref<HTMLElement | null>(null);
const textContainer = ref<HTMLElement | null>(null);
const showText = ref<boolean>(false);
const currentText = ref<string>('');
const skipButton = ref<HTMLElement | null>(null);
const showSkipButton = ref<boolean>(false);
const tooltipRef = ref<HTMLElement | null>(null);


// COLOR SCHEME ----------------------------------------------------------------------------------------------------- //
const colorScheme = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
        {
            style: 'mapbox://styles/mapbox/dark-v11',
            extrusionColor: '#444444'
        } : {
            style: 'mapbox://styles/mapbox/light-v11',
            extrusionColor: '#DDDDDD'
        }
});

let canvas: mapboxgl.Map;
let lastZoom: number = 0;

onMounted(async () => {
    if (!isClient) return;

    // LOAD COUNTRIES ------------------------------------------------------------------------------------------------ //
    const countriesBorders: Feature<Polygon | MultiPolygon> = (
        await fetch('/geojson/countries.geojson').then((res) => res.json())
    );

    // HANDLE DIRECT ACCESS ----------------------------------------------------------------------------------------- //
    let directMapAccess = false;
    let directGlobeAccess = false;
    let directCoordinates: number[] = [];
    const venueAccess = useState('venue');
    const athleteAccess = useState('athlete');
    const sportAccess = useState('sport');
    const countryAccess = useState('country');
    const olympicsAccess = useState('olympics');
    if (venueAccess.value) {
        directMapAccess = true;
        const venue = venues[venueAccess.value as keyof typeof venues] as any;
        directCoordinates = [venue.location.longitude, venue.location.latitude];
    } else if (sportAccess.value) {
        directMapAccess = true;
        const sport = sports[sportAccess.value as keyof typeof sports];
        const venue = venues[sport["venues"][0]["slug"] as keyof typeof venues] as any;
        directCoordinates = [venue.location.longitude, venue.location.latitude];
    } else if (athleteAccess.value) {
        directMapAccess = true;
        const athlete = athletes[athleteAccess.value as keyof typeof athletes];
        const sport = sports[athlete["sports"][0]["slug"] as keyof typeof sports]
        const venue = venues[sport["venues"][0]["slug"] as keyof typeof venues] as any;
        directCoordinates = [venue.location.longitude, venue.location.latitude];
    } else if (olympicsAccess.value) {
        directMapAccess = true;
        // paris view
        directCoordinates = [2.294694, 48.858093]
    } else if (countryAccess.value) {
        directGlobeAccess = true;
        const country = countries[countryAccess.value as keyof typeof countries] as any;
        directCoordinates = [country.location.longitude, country.location.latitude];
    }

    // CREATE MAP --------------------------------------------------------------------------------------------------- //
    if (intro.value || directMapAccess) {
        // globe view
        canvas = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: colorScheme.value.style,
            dragRotate: false,
            center: [5, 43],
            zoom: 2,
            pitch: 0,
            bearing: 440,
            maxZoom: 16,
        });
    } else if (directGlobeAccess) {
        // space view
        canvas = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: colorScheme.value.style,
            dragRotate: false,
            center: [0, 0],
            zoom: 0,
            pitch: 0,
            bearing: 0,
            maxZoom: 16,
        });
    } else {
        // paris view
        canvas = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: colorScheme.value.style,
            dragRotate: false,
            center: [2.294694, 48.858093],
            zoom: 15.5,
            pitch: 55,
            bearing: 0,
            maxZoom: 16,
            minZoom: 10,
            maxBounds: [[2, 48], [3, 50]],
        });
    }
    canvas.touchZoomRotate.disableRotation();
    setCanvas(canvas);

    canvas.on('style.load', async () => {

        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        canvas.style.stylesheet.layers.forEach((layer) => {
            if (layer.type === 'symbol') {
                canvas.removeLayer(layer.id);
            }
        });

        // ADD 3D BUILDINGS LAYER ----------------------------------------------------------------------------------- //
        canvas.addLayer(
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
                    'fill-extrusion-opacity': 0.7
                }
            },
        );

        // COLOR SPECIFIC BUILDINGS --------------------------------------------------------------------------------- //
        Object.keys(venues).forEach(key => {
            venues[key as keyof typeof venues].buildingIds.forEach((id: number) => {
                canvas.setFeatureState(
                    { source: 'composite', sourceLayer: 'building', id },
                    { selected: true }
                );
            });
        });

        // ADD COUNTRY FILLS LAYER ---------------------------------------------------------------------------------- //
        canvas.addSource('cbs', {
            'type': 'geojson',
            'data': countriesBorders
        });
        canvas.addLayer({
            "id": "cf",
            "type": "fill",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-opacity": 0
            }
        });

        // ADD 3D EXTRUSION LAYER ----------------------------------------------------------------------------------- //
        canvas.addLayer({
            "id": "extrusion",
            "type": "fill-extrusion",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-extrusion-color": colorScheme.value.extrusionColor,
                "fill-extrusion-height": 2,
                "fill-extrusion-opacity": 0.7
            },
            "filter": ["==", "name", ""]
        });

        // HANDLE FIRST ANIMATION ------------------------------------------------------------------------------------ //
        if (intro.value && !directMapAccess && !directGlobeAccess) {
            setIntroPlaying(true);
            await playIntro(canvas, signal, showText, textContainer, currentText);
            setIntroPlaying(false);
            setIntro(false);
        } else if (directMapAccess) {
            await new Promise<void>(async (resolve, reject) => {
                if (signal.aborted) return reject();
                canvas.flyTo({
                    center: directCoordinates as [number, number],
                    zoom: 15.5,
                    bearing: 0,
                    pitch: 55,
                    duration: 4000,
                    essential: true,
                    curve: 1
                });
                canvas.once('moveend', () => resolve());
            }).catch(() => { });
        } else if (directGlobeAccess) {
            await new Promise<void>(async (resolve, reject) => {
                if (signal.aborted) return reject();
                canvas.flyTo({
                    center: directCoordinates as [number, number],
                    zoom: 2,
                    bearing: 0,
                    pitch: 0,
                    duration: 2000,
                    essential: true,
                    curve: 1
                });
                canvas.once('moveend', () => resolve());
            }).catch(() => { });
        }

        // SETTLE CANVAS -------------------------------------------------------------------------------------------- //
        if (directGlobeAccess) {
            // @ts-ignore
            settleGlobeCanvas(canvas, tooltipRef, router);
            await setMarkers(canvas, router, false);
        } else {
            settleMapCanvas(canvas);
            await setMarkers(canvas, router);
        }
    });

    // MARKERS UPDATE LOGIC ----------------------------------------------------------------------------------------- //
    canvas.on('move', () => {
        const zoom = canvas.getZoom()
        updateMarkers(canvas, zoom, lastZoom);
        lastZoom = zoom;
    })

    // MAKE COLOR MODE REACTIVE ------------------------------------------------------------------------------------- //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (canvas) {
            canvas.setStyle(colorScheme.value.style);
        }
    });
});

onUnmounted(() => {
    if (isClient && canvas) {
        canvas.remove();
    }
});

// SKIP INTRO LOGIC ------------------------------------------------------------------------------------------------- //
const controller = new AbortController();
const { signal } = controller;
const skipIntro = async () => {
    controller.abort();

    // update refs
    setIntroPlaying(false);
    setIntro(false);
    showText.value = false;

    // fly to paris
    await new Promise<void>((resolve) => {
        canvas.flyTo({
            center: [2.294694, 48.858093],
            zoom: 15.5,
            pitch: 55,
            bearing: 0,
            duration: 2000,
            essential: true,
            curve: 1,
        });
        canvas.once('moveend', () => resolve());
    }).catch(() => { });

    // remove lines
    if (canvas.getLayer('french-line-layer-1')) canvas.removeLayer('french-line-layer-1');
    if (canvas.getSource('french-line-1')) canvas.removeSource('french-line-1');
    if (canvas.getLayer('french-line-layer-2')) canvas.removeLayer('french-line-layer-2');
    if (canvas.getSource('french-line-2')) canvas.removeSource('french-line-2');
    if (canvas.getLayer('french-line-layer-3')) canvas.removeLayer('french-line-layer-3');
    if (canvas.getSource('french-line-3')) canvas.removeSource('french-line-3');
    if (canvas.getLayer('greek-line-layer')) canvas.removeLayer('greek-line-layer');
    if (canvas.getSource('greek-line')) canvas.removeSource('greek-line');

    // settle canvas
    settleMapCanvas(canvas);
    await setMarkers(canvas, router);
};

// SKIP BUTTON LOGIC ------------------------------------------------------------------------------------------------ //
watch(introPlaying, (newVal) => {
    if (newVal) {
        displayButton(showSkipButton, skipButton, 3, 2);
    } else {
        hideButton(showSkipButton, skipButton, 1);
    }
});

</script>
