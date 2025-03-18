<template>
    <div ref="mapContainer" class="flex-1"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {flyInAndRotate} from "~/utils/flyInAndRotate.ts";
import {animatePath} from "~/utils/animatePath.ts";

// check if the code is running on the client side
const isClient = import.meta.client;
const config = useRuntimeConfig();
const router = useRouter();

// Set Mapbox token
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}

// Dev / Production
const intro = config.public.INTRO || '';

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;

const bounds: [[number, number], [number, number]] = [
    [2.0575, 48.7908],
    [2.5279, 48.9494]
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
    },
    {
        coordinates: [2.359627, 48.924549] as [number, number],
        title: 'Stade de France',
        slug: 'stade-de-france'
    },
    {
        coordinates: [2.229182, 48.895226] as [number, number],
        title: 'Paris La Défense Arena',
        slug: 'paris-la-defense-arena'
    },
    {
        coordinates: [2.312772, 48.856091] as [number, number],
        title: 'Les Invalides',
        slug: 'les-invalides'
    }
];

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
    11724440, 1620388745569955, 11724501, 982206810213435, 11724502, 2762294946974215, 2578318733555715,

    // Stade de France
    3009844, 226403486, 226371220, 226371215, 226371208, 226371221, 226371220, 226371215, 226371208, 226371221,
    226371211, 226371214, 226371209, 226371216, 226371219, 226371210, 226371213, 226371217, 226371206, 226371212,
    226371218, 226403485, 226403489, 226403484, 226403485, 226371204, 226371205, 226371207, 226403483, 226403488,
    226403482, 226403487, 3009845,

    // Paris La Défense Arena
    14479234, 443073294,

    // Les Invalides
    3311814, 244945091, 3311815, 3311813, 227662017, 227662016, 227662013, 227662005, 64955066, 5587792508812005,
    64955050, 64955052, 64954996, 64955038, 2361730293122035, 675665594515385, 64955054, 64955021, 1543187662874405,
    64955060, 444949746035355, 64955036, 64955009, 5054577255772795, 64955051, 64955056, 64955057, 4337331195385635,
    4432061787451205, 4094928500208085, 2583020448838855, 5369020551408125, 103202709, 103202696, 103328588,
    916393671934845, 64955044, 3325221, 3325376, 3325377, 262953763357725, 246135656, 246135651, 244945090, 244945093,
    244945092, 227662009, 227662015, 227662007, 227662014, 227662011, 227662012, 227662030, 227662011, 227662008,
    227662010, 227662029, 227662006, 664180362, 246135677, 246135679, 227662023, 227662026, 227662028, 227662027
];

onMounted(async () => {
    if (!isClient) return;

    // ---------------------------------------------- CREATE MAP --------------------------------------------------- //
    if (intro) {
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
    } else {
        map = new mapboxgl.Map({
            container: mapContainer.value as HTMLElement,
            style: "mapbox://styles/mapbox/light-v11",
            center: [2.312772, 48.856091],
            zoom: 15,
            pitch: 50,
            bearing: 0,
            antialias: true,
            maxBounds: bounds,
            minZoom: 10,
            maxZoom: 16,
            dragRotate: false,
        });
    }

    map.on('style.load', () => {
        // --------------------------- REMOVE SYMBOLS (e.g. street names, places, ...) ------------------------------ //
        map?.style.stylesheet.layers.forEach(function (layer) {
            if (layer.type === 'symbol') {
                map?.removeLayer(layer.id);
            }
        });

        // -------------------------------------- COLOR SPECIFIC BUILDINGS ------------------------------------------ //
        buildingIds.forEach(id => {
            map?.setFeatureState(
                {source: 'composite', sourceLayer: 'building', id},
                {selected: true}
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
            await fetch('/geojson/route.geojson').then((res) => res.json())
        );

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
            3000,
            5000000, 300000,
            400, 340,
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
            300000, 1510,
            bearing, 0,
            40, 50,
        );

        // Set properties for final map
        map.dragRotate.disable();
        map.setMinZoom(10);
        map.setMaxBounds(bounds);
        map.removeLayer('line-layer');
        map.removeSource('line');
    }


    // --------------------------------- DYNAMICALLY ADJUST PITCH ON ZOOM ------------------------------------------- //
    map.on('zoom', () => {
        // maps zoom range [10 -> 16] to pitch range [0 -> 60]
        const zoom = map!.getZoom();
        const pitch = (zoom - 10) * 10;
        map!.setPitch(pitch);
    })

    // ------------------------------------------- ADD MARKERS ------------------------------------------------------ //
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

    // ------------------------------------------- DEBUGGING -------------------------------------------------------- //
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