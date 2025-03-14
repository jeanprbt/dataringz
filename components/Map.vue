<template>
    <div ref="mapContainer" class="flex-1"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// In Nuxt, we need to check if we're on the client side before using browser APIs
const isClient = import.meta.client;
const config = useRuntimeConfig();
const router = useRouter();

// Set Mapbox token
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;

const bounds: [[number, number], [number, number]] = [
    [2.1521757561875177, 48.772008385801996],
    [2.6014740644074266, 48.965439112291676]
];

const markers = [
    {
        coordinates: [2.294694, 48.858093] as [number, number],
        title: 'Eiffel Tower',
        slug: 'eiffel-tower'
    },
    {
        coordinates: [2.312156, 48.866096] as [number, number],
        title: 'Grand Palais',
        slug: 'grand-palais'
    }
];

onMounted(() => {
    if (!isClient) return;

    // ---------------------------------------------- CREATE MAP --------------------------------------------------- //
    map = new mapboxgl.Map({
        container: mapContainer.value as HTMLElement,
        style: "mapbox://styles/mapbox/light-v11",
        center: [2.294694, 48.858093],
        zoom: 15,
        pitch: 45,
        bearing: 0,
        antialias: true,
        maxBounds: bounds,
        minZoom: 12,
        maxZoom: 16
    });

    // --------------------------------------------- ADD MARKERS -------------------------------------------------- //
    markers.forEach(function (feat) {
        new mapboxgl.Marker({
            color: '#FF0000',
            draggable: false
        })
            .setLngLat(feat.coordinates)
            .addTo(map!)
            .getElement().addEventListener('click', () => {
                router.push(`/venue/${feat.slug}`);
            });
    });

    map.on('style.load', () => {
        // --------------------------- REMOVE SYMBOLS (e.g. street names, places, ...) ------------------------------ //
        map?.style.stylesheet.layers.forEach(function (layer) {
            if (layer.type === 'symbol') {
                map?.removeLayer(layer.id);
            }
        });

        // -------------------------------------- COLOR SPECIFIC BUILDINGS ------------------------------------------ //
        const buildingIds = [
            // Eiffel Tower
            308687747, 308687744, 308689166, 308687752, 308687748, 308687745, 308687754, 308687750, 308689167, 308687746,
            308687755, 308145258, 4114839, 308687751, 308689165, 449952613, 308689164, 308145259, 4114839, 308687753,
            4114842, 4114841, 308145239, 69034127, 69034135, 69034180, 308687749, 69034179, 69034135, 308145236,
            335101038, 308145234, 308145237, 308145233, 335101028, 335101035, 69034165,

            // Grand Palais
            822470559, 822470557, 822470558, 822470542, 822470525, 822470553, 188108997, 822470554, 822470565
        ];
        buildingIds.forEach(id => {
            map?.setFeatureState(
                { source: 'composite', sourceLayer: 'building', id },
                { selected: true }
            );
        });

        // --------------------------------------- ADD 3D BUILDINGS LAYER ------------------------------------------- //
        map?.addLayer(
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
                        '#ff0000', // color for highlighted buildings
                        '#aaa' // default color
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'min_height'],
                    'fill-extrusion-opacity': 0.6
                }
            },
        );
    });

    // ------------------------------------------------- DEBUGGING ------------------------------------------------ //
    // Display building ID on clock
    map.on('click', (e) => {
        const features = map?.queryRenderedFeatures(e.point, {
            layers: ['add-3d-buildings']
        });
        if (features && features.length > 0) {
            const buildingId = features[0].id;
            console.log('Building ID:', buildingId);
        }
    });

    // Display longitude and latitude on click
    map.on('click', function (e) {
        let coordinates = e.lngLat;
        console.log('You clicked here:', coordinates);
    });
});

onUnmounted(() => {
    if (isClient && map) {
        map.remove();
        map = null;
    }
});
</script>