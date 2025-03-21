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
import { playIntro, setFinalProperties, start, paris} from "~/utils/intro";

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
        map.once('moveend', () => resolve());
    }).catch(() => {});
    setFinalProperties(map);
    await setMarkers();
};


// COLOR SCHEME ----------------------------------------------------------------------------------------------------- //
const color = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
});

// MARKERS ---------------------------------------------------------------------------------------------------------- //
const setMarkers = async () => {
    // Load venues data directly from venues.json
    const response = await fetch('/data/venues.json');
    const venuesData = await response.json();
    
    venues.features.forEach(function (venue) {
        const venueSlug = venue.properties!.slug;
        const venueInfo = venuesData[venueSlug];
        
        // Create a custom HTML element for the marker
        const el = document.createElement('div');
        el.className = 'venue-marker';
        el.style.cursor = 'pointer';
        
        // Style the container
        el.style.display = 'flex';
        el.style.flexWrap = 'wrap';
        el.style.justifyContent = 'center';
        el.style.width = '50px';
        el.style.height = 'auto';
        el.style.background = 'rgba(255, 255, 255, 0.8)';
        el.style.borderRadius = '10px';
        el.style.padding = '5px';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        // Add sports icons to the marker
        if (venueInfo && venueInfo.sports && venueInfo.sports.length > 0) {
            // Add icons for each sport in the venue
            for (const sport of venueInfo.sports) {
                const iconContainer = document.createElement('div');
                iconContainer.style.width = '30px';
                iconContainer.style.height = '30px';
                iconContainer.style.margin = '2px';
                
                const img = document.createElement('img');
                img.src = sport.icon;
                img.alt = sport.name;
                img.style.width = '100%';
                img.style.height = '100%';
                
                iconContainer.appendChild(img);
                el.appendChild(iconContainer);
            }
        } else {
            // Fallback for venues with no sports
            const defaultMarker = document.createElement('div');
            defaultMarker.style.width = '20px';
            defaultMarker.style.height = '20px';
            defaultMarker.style.borderRadius = '50%';
            defaultMarker.style.backgroundColor = '#FF0000';
            el.appendChild(defaultMarker);
        }
        
        // Create a new marker using the custom element
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        })
            .setLngLat(venue.geometry.coordinates as [number, number])
            .addTo(map);
            
        // Add click event
        marker.getElement().addEventListener('click', () => {
            router.push(`/venue/${venueSlug}`);
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
        await setMarkers();
    });
});

onUnmounted(() => {
    if (isClient && map) {
        map.remove();
    }
});
</script>