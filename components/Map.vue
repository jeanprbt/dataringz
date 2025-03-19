<template>
    <div ref="mapContainer" class="flex-1"></div>
</template>

<script setup lang="ts">
import mapboxgl, { type EasingOptions, type MapOptions } from 'mapbox-gl';
import type { FeatureCollection, Feature, LineString, Point } from "geojson";
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    animatePath,
    type AnimatePathOptions,
    start,
    olympia,
    marseille,
    paris,
    path,
    guiana,
    caledonia,
    reunion,
    polynesia,
    guadeloupe,
    martinique,
    nice
} from "~/utils/intro";

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

onMounted(async () => {
    if (!isClient) return;

    // FETCH VENUES ------------------------------------------------------------------------------------------------- //
    const venues: FeatureCollection<Point> = (
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

            // LOAD TRACKS ------------------------------------------------------------------------------------------ //
            const trackFrance1: Feature<LineString> = (
                await fetch('/geojson/track_france_1.geojson').then((res) => res.json())
            );
            const trackFrance2: Feature<LineString> = (
                await fetch('/geojson/track_france_2.geojson').then((res) => res.json())
            );
            const trackGreece: Feature<LineString> = (
                await fetch('/geojson/track_greece.geojson').then((res) => res.json())
            )

            // ADD LINES -------------------------------------------------------------------------------------------- //
            map.addSource("french-line-1", {
                type: "geojson",
                lineMetrics: true,
                data: trackFrance1,
            });
            map.addSource("french-line-2", {
                type: "geojson",
                lineMetrics: true,
                data: trackFrance2,
            })
            map.addSource("greek-line", {
                type: "geojson",
                lineMetrics: true,
                data: trackGreece,
            })
            map.addLayer({
                id: "french-line-layer-1",
                type: "line",
                source: "french-line-1",
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
            map.addLayer({
                id: "french-line-layer-2",
                type: "line",
                source: "french-line-2",
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
            map.addLayer({
                id: "greek-line-layer",
                type: "line",
                source: "greek-line",
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

            // FLY TO OLYMPIA ---------------------------------------------------------------------------------------- //
            await new Promise<void>(async (resolve) => {
                map.flyTo({
                    ...olympia,
                    duration: 2000,
                    essential: true,
                    curve: 1,
                } as EasingOptions);
                map.once('moveend', resolve);
            });

            // ANIMATE GREEK TRACK ---------------------------------------------------------------------------------- //
            await animatePath({
                map: map,
                duration: 2000,
                track: trackGreece,
                layerId: "greek-line-layer",
                ...path,
            } as AnimatePathOptions);

            // FLY TO MARSEILLE ------------------------------------------------------------------------------------- //
            await new Promise<void>(async (resolve) => {
                map.flyTo({
                    ...marseille,
                    duration: 2000,
                    essential: true,
                    curve: 1,
                } as EasingOptions);
                map.once('moveend', resolve);
            });

            // ANIMATE FRENCH TRACK PT. 1 --------------------------------------------------------------------------- //
            await animatePath({
                map: map,
                duration: 10000,
                track: trackFrance1,
                layerId: "french-line-layer-1",
                ...path,
            } as AnimatePathOptions);

            // FLY TO DOM-TOM --------------------------------------------------------------------------------------- //
            const locations = [guiana, caledonia, reunion, polynesia, guadeloupe, martinique, nice];
            for (const location of locations) {
                await new Promise<void>((resolve) => {
                    map.flyTo({ ...location, duration: 2000, essential: true, curve: 1 } as EasingOptions);
                    map.once('moveend', resolve);
                });
            }

            // ANIMATE FRENCH TRACK PT.2 ---------------------------------------------------------------------------- //
            await animatePath({
                map: map,
                duration: 10000,
                track: trackFrance2,
                layerId: "french-line-layer-2",
                ...path,
            } as AnimatePathOptions);

            // FLY TO PARIS ----------------------------------------------------------------------------------------- //
            await new Promise<void>(async (resolve) => {
                map.flyTo({
                    ...paris,
                    duration: 2000,
                    essential: true,
                    curve: 1,
                } as EasingOptions);
                map.once('moveend', resolve);
            });

            // SET FINAL PROPERTIES --------------------------------------------------------------------------------- //
            map.removeLayer('french-line-layer-1');
            map.removeSource('french-line-1');
            map.removeLayer('french-line-layer-2');
            map.removeSource('french-line-2');
            map.removeLayer('greek-line-layer');
            map.removeSource('greek-line');
            map.setMinZoom(10);
            map.setMaxBounds([
                [2.0575, 48.7908],
                [2.5279, 48.9494]
            ]);
            map.dragRotate.disable();
        }

        // DYNAMICALLY ADJUST PITCH ON ZOOM ------------------------------------------------------------------------- //
        map.on('zoom', () => {
            // maps zoom range [10 -> 16] to pitch range [0 -> 60]
            const zoom = map!.getZoom();
            const pitch = (zoom - 10) * 10;
            map.setPitch(pitch);
        })

        //  ADD MARKERS --------------------------------------------------------------------------------------------- //
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

        // DEBUGGING ------------------------------------------------------------------------------------------------ //
        /*
        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['add-3d-buildings']
            });
            if (features && features.length > 0) {
                const buildingId = features[0].id;
                console.log('Building ID:', buildingId);
            }
        });

        map.on('click', function (e) {
            let coordinates = e.lngLat;
            console.log('You clicked here:', coordinates);
        });
        */

    });
});

onUnmounted(() => {
    if (isClient && map) {
        map.remove();
    }
});
</script>