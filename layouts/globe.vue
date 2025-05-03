<template>
    <div ref="mapRef" :class="['flex-1 relative overflow-hidden']"></div>
    <div ref="tooltipRef"
        class="absolute bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white p-2 rounded shadow pointer-events-none">
    </div>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, { type EasingOptions } from 'mapbox-gl';
import type { Feature, Polygon, MultiPolygon } from "geojson";

import countries from '~/data/countries.json';

// COMPOSABLES ------------------------------------------------------------------------------------------------------ //
const router = useRouter();
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

// HANDLE DIRECT ACCESS  -------------------------------------------------------------------------------------------- //
const directCountryAccess = useState('country');
let directAccess: boolean = false;

// UI STATE --------------------------------------------------------------------------------------------------------- //
let click: boolean = false;

onMounted(async () => {
    if (!isClient) return;

    // HANDLE DIRECT ACCESS ----------------------------------------------------------------------------------------- //
    let countryCoordinates = [] as number[];
    if (directCountryAccess.value) {
        directAccess = true;
        const country = countries[directCountryAccess.value as keyof typeof countries] as any;
        countryCoordinates = [country.location.longitude, country.location.latitude] as [number, number];
    }

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

    globe.on('style.load', async function () {

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

        if (directAccess) {
            await new Promise<void>(async (resolve) => {
                globe.flyTo({ center: countryCoordinates, zoom: 3.5, duration: 2000, essential: true, curve: 1 } as EasingOptions);
                globe.once('moveend', () => resolve());
            }).catch(() => { });
        }


        // HANDLE HOVER (TOOLTIP + COUNTRY EXTRUSION) ------------------------------------------------------------------
        globe.on("mousemove", function (e) {
            if (click) return;
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
        globe.on("click", async function (e) {
            const features = globe.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                globe.setFilter("extrusion", ["==", "name", ""]);
                const tooltip = tooltipRef.value;
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
                const country = countries[features[0].properties!.slug as keyof typeof countries];
                click = true;
                await flyToCountry(globe, [country.location.longitude, country.location.latitude] as [number, number]);
                setTimeout(() => {
                    click = false;
                }, 1000);
                router.push(`/country/${country.slug}`);
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
