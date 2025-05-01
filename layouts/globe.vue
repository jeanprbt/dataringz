<template>
    <div ref="mapRef" :class="['flex-1 relative overflow-hidden']"></div>
    <div ref="tooltipRef" class="absolute bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white p-2 rounded shadow pointer-events-none"></div>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}

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

onMounted(() => {

    // CREATE MAP --------------------------------------------------------------------------------------------------- //
    const map = new mapboxgl.Map({
        container: mapRef.value as HTMLElement,
        style: colorScheme.value.style,
        center: [2.209667, 46.232193],
        minZoom: 2,
        maxZoom: 3.5
    });
    
    map.on('style.load', function () {

        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        map.style.stylesheet.layers.forEach((layer) => {
            if (layer.type === 'symbol') {
                map.removeLayer(layer.id);
            }
        });

        // ADD COUNTRY FILLS LAYER ---------------------------------------------------------------------------------- //
        map.addSource('cbs', { 
            'type': 'geojson',
            'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
        });
        map.addLayer({
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
        map.addLayer({
            "id": "extrusion",
            "type": "fill-extrusion",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-extrusion-color": colorScheme.value.extrusionColor,
                "fill-extrusion-height": 2, // Default height
                "fill-extrusion-opacity": 0.7
            },
            "filter": ["==", "name", ""]
        });


        // HANDLE HOVER (TOOLTIP + COUNTRY EXTRUSION) ------------------------------------------------------------------
        map.on("mousemove", function (e) {
            const features = map.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                map.setFilter("extrusion", ["==", "name", features[0].properties!.name]);
                const tooltip = tooltipRef.value;
                if (tooltip) {
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${e.point.x + 10}px`;
                    tooltip.style.top = `${e.point.y + 10}px`;
                    tooltip.innerText = features[0].properties!.name;
                }
            } else {
                map.setFilter("extrusion", ["==", "name", ""]);
                const tooltip = tooltipRef.value;
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            }
        });
        map.on("mouseout", function () {
            map.setFilter("extrusion", ["==", "name", ""]);
            const tooltip = tooltipRef.value;
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        });

        // HANDLE CLICK --------------------------------------------------------------------------------------------- //
        map.on("click", function (e) {
            const features = map.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                const countryCenter = e.lngLat;
                map.flyTo({
                    center: [countryCenter.lng, countryCenter.lat],
                    zoom: 3.5,
                    essential: true
                })
            }
        });
    });
    
    // MAKE COLOR MODE REACTIVE ------------------------------------------------------------------------------------- //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (map) {
            map.setStyle(colorScheme.value.style);
        }
    });
});
</script>
