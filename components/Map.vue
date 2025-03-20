<template>
    <div ref="mapContainer" class="flex-1 relative"></div>
    <button
        v-if="introPlaying"
        @click="skipIntro"
        class="absolute bottom-30 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded-lg shadow-md">
        skip intro
    </button>
</template>

<script setup lang="ts">
import mapboxgl, { type EasingOptions, type MapOptions } from 'mapbox-gl';
import type { FeatureCollection, Point } from "geojson";
import 'mapbox-gl/dist/mapbox-gl.css';
import { playIntro, setFinalProperties, start, paris } from "~/utils/intro";

const isClient = import.meta.client;
const config = useRuntimeConfig();
const router = useRouter();

if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}
const intro = config.public.INTRO || '';

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map;

let venues: FeatureCollection<Point>

// SKIP INTRO LOGIC ------------------------------------------------------------------------------------------------- //
const controller = new AbortController();
const { signal } = controller;
const introPlaying = ref(false);
const skipIntro = async () => {
    controller.abort();
    introPlaying.value = false;
    await new Promise<void>((resolve) => {
        map.flyTo({
            ...paris,
            duration: 2000,
            essential: true,
            curve: 1,
        } as EasingOptions);
        map.once('moveend', resolve);
    }).catch(() => {});
    setFinalProperties(map);
    setMarkers();
};


// COLOR SCHEME ----------------------------------------------------------------------------------------------------- //
const color = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
});

// MARKERS ---------------------------------------------------------------------------------------------------------- //
const setMarkers = () => {
    venues.features.forEach(function (venue) {
        const markerElement = new mapboxgl.Marker({
            color: '#FF0000',
            draggable: false
        })
            .setLngLat(venue.geometry.coordinates as [number, number])
            .addTo(map)
            .getElement();
            
        markerElement.style.cursor = 'pointer';
        
        markerElement.addEventListener('click', () => {
            router.push(`/venue/${venue.properties!.slug}`);
        });
    });
};

onMounted(async () => {
    if (!isClient) return;

    // FETCH VENUES ------------------------------------------------------------------------------------------------- //
    venues = (
        await fetch('/geojson/venues.geojson').then((res) => res.json())
    );

    // CREATE MAP --------------------------------------------------------------------------------------------------- //
    if (intro) {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: color.value,
            maxZoom: 16,
            ...start
        } as MapOptions);
    } else {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: color.value,
            maxZoom: 16,
            minZoom: 10,
            dragRotate: false,
            maxBounds: [
                [2.0575, 48.7908],
                [2.5279, 48.9494]
            ],
            ...paris,
        } as MapOptions);
    }

    map.on('style.load', async () => {

        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        map.style.stylesheet.layers.forEach(function (layer) {
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

        // -------------------------------------- COLOR SPECIFIC BUILDINGS ------------------------------------------ //
        venues.features.forEach(v => {
            v.properties?.buildingIds.forEach((id: number) => {
                map.setFeatureState(
                    {source: 'composite', sourceLayer: 'building', id},
                    {selected: true}
                );
            });
        });

        // PLAY INTRO ANIMATION ------------------------------------------------------------------------------------- //
        if(intro) {
            introPlaying.value = true;
            await playIntro(map, signal);
            introPlaying.value = false;
        }

        //  ADD MARKERS --------------------------------------------------------------------------------------------- //
        setMarkers();
    });
});

onUnmounted(() => {
    if (isClient && map) {
        map.remove();
    }
});
</script>