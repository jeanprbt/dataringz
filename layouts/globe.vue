<template>
    <div ref="mapRef" :class="['flex-1 relative overflow-hidden']"></div>
    <div ref="tooltipRef" class="absolute bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white p-2 rounded shadow pointer-events-none"></div>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import type { Feature, Polygon, MultiPolygon } from "geojson";

import countries from '~/data/countries.json';

// COMPOSABLES ------------------------------------------------------------------------------------------------------ //
const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}
const { setGlobe } = useGlobe();


// REFS ------------------------------------------------------------------------------------------------------------- //
const mapRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

// COLOR SCHEME ----------------------------------------------------------------------------------------------------- //
const colorScheme = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 
        {
            style: 'mapbox://styles/mapbox/dark-v11',
            fillColor: '#2A2A2A',
            extrusionColor: '#444444'
        } : {
            style: 'mapbox://styles/mapbox/light-v11',
            fillColor: '#FCFCFD',
            extrusionColor: '#DDDDDD'
        }
});

onMounted(async () => {

    // LOAD COUNTRIES ------------------------------------------------------------------------------------------------ //
    const countriesBorders: Feature<Polygon | MultiPolygon> = (
        await fetch('/geojson/countries.geojson').then((res) => res.json())
    );

    // CREATE GLOBE --------------------------------------------------------------------------------------------------//
    const globe = new mapboxgl.Map({
        container: mapRef.value as HTMLElement,
        style: colorScheme.value.style,
        center: [2.209667, 46.232193],
        minZoom: 2,
        maxZoom: 3.5
    });
    setGlobe(globe);
    
    globe.on('style.load', function () {

        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        globe.style.stylesheet.layers.forEach((layer) => {
            if (layer.type === 'symbol') {
                globe.removeLayer(layer.id);
            }
        });

        // ADD COUNTRY FILLS LAYER ---------------------------------------------------------------------------------- //
        globe.addSource('cbs', { 
            'type': 'geojson',
            'data': countriesBorders
        });
        globe.addLayer({
            "id": "cf",
            "type": "fill",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-color": colorScheme.value.fillColor,
                "fill-opacity": 0.5
            }
        });

        // ADD 3D EXTRUSION LAYER ----------------------------------------------------------------------------------- //
        globe.addLayer({
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


        // HANDLE HOVER (TOOLTIP + COUNTRY EXTRUSION) ------------------------------------------------------------------
        globe.on("mousemove", function (e) {
            const features = globe.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                globe.setFilter("extrusion", ["==", "name", features[0].properties!.name]);
                const tooltip = tooltipRef.value;
                if (tooltip) {
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${e.point.x + 10}px`;
                    tooltip.style.top = `${e.point.y + 10}px`;
                    tooltip.innerText = features[0].properties!.name;
                }
            } else {
                globe.setFilter("extrusion", ["==", "name", ""]);
                const tooltip = tooltipRef.value;
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            }
        });
        globe.on("mouseout", function () {
            globe.setFilter("extrusion", ["==", "name", ""]);
            const tooltip = tooltipRef.value;
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        });

        // HANDLE CLICK --------------------------------------------------------------------------------------------- //
        globe.on("click", function (e) {
            const features = globe.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                const country = countries[features[0].properties!.slug as keyof typeof countries];
                globe.flyTo({
                    center: [country.location.longitude, country.location.latitude],
                    zoom: 3.5,
                    essential: true
                })
            }
        });
    });
    
    // MAKE COLOR MODE REACTIVE ------------------------------------------------------------------------------------- //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (globe) {
            globe.setStyle(colorScheme.value.style);
        }
    });
});
</script>
