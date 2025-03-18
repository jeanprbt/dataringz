<template>
    <div ref="mapContainer" class="flex-1"></div>
</template>

<script setup lang="ts">
import mapboxgl, {type MapOptions} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {flyInAndRotate, animatePath} from "~/utils/intro";

const isClient = import.meta.client;
const config = useRuntimeConfig();
const router = useRouter();


if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}
const intro = config.public.INTRO || '';

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map;

const color = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
});

const MAP_PARAMS = {
    center: [2.312772, 48.856091],
    zoom: 15.5,
    pitch: 55,
    bearing: 0,
    antialias: true,
    maxZoom: 16,
    minZoom: 10,
    maxBounds: [
        [2.0575, 48.7908],
        [2.5279, 48.9494]
    ],
    dragRotate: false
}

const INTRO_PARAMS = {
    duration_1: 3000,
    duration_2: 30000,
    duration_3: 5000,
    initial_zoom: 2,
    mid_zoom: 7,
    initial_bearing: 400,
    mid_bearing: 340,
    initial_pitch: 30,
    mid_pitch: 50,
}

onMounted(async () => {
    if (!isClient) return;

    const venues: GeoJSON.FeatureCollection<GeoJSON.Point> = (
        await fetch('/geojson/venues.geojson').then((res) => res.json())
    );

    // ---------------------------------------------- CREATE MAP --------------------------------------------------- //
    if (intro) {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: color.value,
            center: [2.312772, 48.856091],
            zoom: 2,
            pitch: 30,
            bearing: 0,
            antialias: true,
            maxZoom: 16,
        });
    } else {
        map = new mapboxgl.Map({
            ...MAP_PARAMS as MapOptions,
            container: mapContainer.value as HTMLElement,
            style: color.value,
        });
    }

    map.on('style.load', () => {
        // --------------------------- REMOVE SYMBOLS (e.g. street names, places, ...) ------------------------------ //
        map.style.stylesheet.layers.forEach(function (layer) {
            if (layer.type === 'symbol') {
                map.removeLayer(layer.id);
            }
        });

        // -------------------------------------- COLOR SPECIFIC BUILDINGS ------------------------------------------ //
        venues.features.forEach(v => {
            v.properties?.buildingIds.forEach((id: number) => {
                map.setFeatureState(
                    {source: 'composite', sourceLayer: 'building', id},
                    {selected: true}
                );
            });
        });

        // --------------------------------------- ADD 3D BUILDINGS LAYER ------------------------------------------- //
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
    });


    // ---------------------------------------- PLAY INTRO ANIMATION ------------------------------------------------ //
    if (intro) {
        const track: GeoJSON.Feature<GeoJSON.LineString> = (
            await fetch('/geojson/track.geojson').then((res) => res.json())
        );

        map.addSource("line", {
            type: "geojson",
            lineMetrics: true,
            data: track,
        });
        map.addLayer({
            id: "line-layer",
            type: "line",
            source: "line",
            paint: {
                "line-color": "rgba(0,0,0,0)",
                "line-width": 9,
                "line-opacity": 0.8,
            },
            layout: {
                "line-cap": "round",
                "line-join": "round",
            },
        });

        // Retrieve starting point, to be used for animating a zoom-in from high altitude
        let targetLngLat = {
            lng: track.geometry.coordinates[0][0],
            lat: track.geometry.coordinates[0][1],
        };

        // Animate zooming in to the start point, get the final bearing and altitude for use in the next animation
        await flyInAndRotate(
            map,
            targetLngLat,
            INTRO_PARAMS.duration_1,
            INTRO_PARAMS.initial_zoom,
            INTRO_PARAMS.mid_zoom,
            INTRO_PARAMS.initial_bearing,
            INTRO_PARAMS.mid_bearing,
            INTRO_PARAMS.initial_pitch,
            INTRO_PARAMS.mid_pitch,
        );

        // Follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
        let bearing = await animatePath(
            map,
            INTRO_PARAMS.duration_2,
            track,
            INTRO_PARAMS.mid_zoom,
            INTRO_PARAMS.mid_pitch,
            INTRO_PARAMS.mid_bearing
        );

        // Retrieve end point, to be used for animating a zoom-in from high altitude
        let trackLength = track.geometry.coordinates.length
        targetLngLat = {
            lng: track.geometry.coordinates[trackLength - 1][0],
            lat: track.geometry.coordinates[trackLength - 1][1],
        };


        // Animate to a final view
        await flyInAndRotate(
            map,
            targetLngLat,
            INTRO_PARAMS.duration_3,
            INTRO_PARAMS.mid_zoom,
            MAP_PARAMS.zoom,
            bearing,
            MAP_PARAMS.bearing,
            INTRO_PARAMS.mid_pitch,
            MAP_PARAMS.pitch,
        );

        // Set properties for final map
        map.removeLayer('line-layer');
        map.removeSource('line');
        map.setMinZoom(MAP_PARAMS.minZoom);
        map.setMaxBounds(MAP_PARAMS.maxBounds as mapboxgl.LngLatBoundsLike);
        map.dragRotate.disable();
    }

    // --------------------------------- DYNAMICALLY ADJUST PITCH ON ZOOM ------------------------------------------- //
    map.on('zoom', () => {
        // maps zoom range [10 -> 16] to pitch range [0 -> 60]
        const zoom = map!.getZoom();
        const pitch = (zoom - 10) * 10;
        map.setPitch(pitch);
    })

    // ------------------------------------------- ADD MARKERS ------------------------------------------------------ //
    venues.features.forEach(function (venue) {
        new mapboxgl.Marker({
            color: '#FF0000',
            draggable: false
        })
            .setLngLat(venue.geometry.coordinates as [number, number])
            .addTo(map)
            .getElement().addEventListener('click', () => {
            router.push(`/venue/${venue.properties!.slug}`);
        });
    });

    // ------------------------------------------- DEBUGGING -------------------------------------------------------- //
    // Display building ID on clock
    map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
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
    }
});
</script>