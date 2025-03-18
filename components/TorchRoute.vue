<template>
    <div ref="mapContainer" class="flex-1"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { flyInAndRotate  } from "~/utils/flyInAndRotate";
import { animatePath } from "~/utils/animatePath.ts";

const isClient = import.meta.client;
const config = useRuntimeConfig();

// Set Mapbox token
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;


onMounted(() => {
    if (!isClient) return;

    // Create map
    map = new mapboxgl.Map({
        container: mapContainer.value as HTMLElement,
        style: "mapbox://styles/mapbox/light-v11",
        center: [2.312772, 48.856091],
        zoom: 2,
        pitch: 30,
        bearing: 0,
        antialias: true,
        maxZoom: 16,
    });

    map.on('style.load', async () => {
        // Remove symbols (e.g. street names, cities, etc.)
        map?.style.stylesheet.layers.forEach(function (layer) {
            if (layer.type === 'symbol') {
                map?.removeLayer(layer.id);
            }
        });

        // Add 3D buildings layer
        map?.addLayer({
            id: 'add-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6
            }
        });

        // fetch geojson line data
        const track: GeoJSON.Feature<GeoJSON.LineString> = await fetch('/geojson/route.geojson')
            .then((res) => res.json());

        await playAnimations(track);
    });

    const playAnimations = async (track: GeoJSON.Feature<GeoJSON.LineString>) => {
       // Add line to the map
        map?.addSource("line", {
            type: "geojson",
            lineMetrics: true,
            data: track,
        });
        map?.addLayer({
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
        let {bearing, altitude} = await flyInAndRotate(
            map!,
            targetLngLat,
            5000,
            3000000, 300000,
            0, -20,
            30, 50,
        );

        // Follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
        bearing = await animatePath(
            map!,
            30000,
            track, bearing,
            altitude, 50,
        );

        // Retrieve end point, to be used for animating a zoom-in from high altitude
        let trackLength = track.geometry.coordinates.length
        targetLngLat = {
            lng: track.geometry.coordinates[trackLength - 1][0],
            lat: track.geometry.coordinates[trackLength - 1][1],
        };

        // Animate to a final view
        await flyInAndRotate(
            map!,
            targetLngLat,
            5000,
            300000, 1000,
            bearing, 0,
            40, 50,
        )
    };
});


onUnmounted(() => {
    if (isClient && map) {
        map.remove();
        map = null;
    }
});
</script>