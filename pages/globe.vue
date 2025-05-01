<template>
    <div ref="mapRef" :class="['flex-1 relative overflow-hidden']"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';

const config = useRuntimeConfig();
const isClient = import.meta.client;
if (isClient) {
    mapboxgl.accessToken = config.public.MAPBOX_API_KEY || '';
}

const mapRef = ref<HTMLElement | null>(null);

onMounted(() => {
    const map = new mapboxgl.Map({
        container: mapRef.value as HTMLElement,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40], // starting position [lng, lat]
        zoom: 2, // Set initial zoom level
        minZoom: 2, // Cap minimum zoom level
        maxZoom: 3, // Cap maximum zoom level
    });

    let popup: mapboxgl.Popup | null = null;

    map.on('load', function () {
        // REMOVE SYMBOLS (e.g. street names, places, ...) ---------------------------------------------------------- //
        const layers = map.getStyle().layers;
        layers?.forEach((layer) => {
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                map.removeLayer(layer.id);
            }
        });

        map.addSource('cbs', {  // country-boundaries-simplified
            'type': 'geojson',
            'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
        });

        map.addLayer({
            "id": "cf",  // country-fills
            "type": "fill",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-color": "#DDDDDD",
                "fill-opacity": 0.5
            }
        });

        map.addLayer({
            "id": "extrusion", // country-extrusion
            "type": "fill-extrusion",
            "source": "cbs",
            "layout": {},
            "paint": {
                "fill-extrusion-color": "#FFFFFF",
                "fill-extrusion-height": 2, // Default height
                "fill-extrusion-opacity": 0.7
            },
            "filter": ["==", "name", ""]
        });

        // When the user moves their mouse over the map, show the country name in a popup
        map.on("mousemove", function (e) {
            const features = map.queryRenderedFeatures(e.point, { layers: ["cf"] });

            if (features.length) {
                map.getCanvas().style.cursor = 'pointer';

                // Update the filter for the extrusion layer to match the hovered country
                map.setFilter("extrusion", ["==", "name", features[0].properties!.name]);

                // Show popup with country name
                if (popup) {
                    popup.remove();
                }
                popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                })
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>${features[0].properties!.name}</strong>`)
                    .addTo(map);
            } else {
                // Reset the extrusion layer when no country is hovered
                map.setFilter("extrusion", ["==", "name", ""]);
                map.getCanvas().style.cursor = '';

                // Remove popup
                if (popup) {
                    popup.remove();
                    popup = null;
                }
            }
        });

        // Reset the extrusion layer and remove popup when the mouse leaves the map
        map.on("mouseout", function () {
            map.getCanvas().style.cursor = 'auto';
            map.setFilter("extrusion", ["==", "name", ""]);

            if (popup) {
                popup.remove();
                popup = null;
            }
        });

        map.on("click", function (e) {
            const features = map.queryRenderedFeatures(e.point, { layers: ["cf"] });
            if (features.length) {
                const countryCenter = e.lngLat;

                // Fly to the clicked country
                map.flyTo({
                    center: [countryCenter.lng, countryCenter.lat],
                    zoom: 5, // Zoom level for the "dive in" effect
                    speed: 1.2, // Fly speed
                    curve: 1.5, // Fly curve
                    essential: true // This animation is essential
                });
            }
        });
    });
});
</script>