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
    [2.10, 48.70],
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
    },
    {
        coordinates: [2.120728, 48.804694] as [number, number],
        title: 'Château de Versailles',
        slug: 'chateau-de-versailles'
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
            822470559, 822470557, 822470558, 822470542, 822470525, 822470553, 188108997, 822470554, 822470565,

            // Château de Versailles
            1149002, 9087585, 74623864, 74623864, 224643670, 74630920, 124675339, 6697708, 6697704, 2122058393272355,
            826644275091995, 5940542478555, 6697716, 6697709, 74634508, 74627901, 74630471, 74626528, 6697712, 
            124675247, 124675249, 124675246, 124675248, 95475818, 95475853, 92635973, 92635980, 92635985, 92635946, 
            11724440, 1620388745569955, 11724501, 982206810213435, 11724502, 2762294946974215, 2578318733555715
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