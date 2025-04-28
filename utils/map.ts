import mapboxgl, { LngLatBounds, type Marker, type EasingOptions } from 'mapbox-gl';
import { type Router } from 'vue-router';
import * as turf from 'turf';
import { h, render } from 'vue';
import { MarkerIcon } from '#components';
import venues from '~/data/venues.json';

let markers = new Map<Marker, [number, number]>();
const markerDirections = reactive(new Map<mapboxgl.Marker, Ref<number>>());

// SET FINAL PROPERTIES --------------------------------------------------------------------------------------------- //
const setFinalProperties = (map: mapboxgl.Map): void => {

    // remove intro lines
    if (map.getLayer('french-line-layer-1')) {
        map.removeLayer('french-line-layer-1');
    }
    if (map.getSource('french-line-1')) {
        map.removeSource('french-line-1');
    }
    if (map.getLayer('french-line-layer-2')) {
        map.removeLayer('french-line-layer-2');
    }
    if (map.getSource('french-line-2')) {
        map.removeSource('french-line-2');
    }
    if (map.getLayer('french-line-layer-3')) {
        map.removeLayer('french-line-layer-3');
    }
    if (map.getSource('french-line-3')) {
        map.removeSource('french-line-3');
    }
    if (map.getLayer('greek-line-layer')) {
        map.removeLayer('greek-line-layer');
    }
    if (map.getSource('greek-line')) {
        map.removeSource('greek-line');
    }

    // set final camera properties
    const { lng: lng, lat: lat } = map.getCenter();
    map.setMinZoom(10);
    map.setMaxBounds([
        [lng - 1, lat - 1],
        [lng + 1, lat + 1]
    ]);

    // set initial pitch based on zoom
    const initialZoom = map.getZoom();
    map.setPitch(Math.max(0, Math.min(60, (initialZoom - 10) * 10)));

    // override scrollZoom renderFrame to add pitch updates
    const scrollZoom = map.scrollZoom as any;
    const originalRenderFrame = scrollZoom.renderFrame;
    scrollZoom.renderFrame = function () {
        const result = originalRenderFrame.call(this);
        if (result?.zoomDelta) {
            const targetZoom = map.getZoom() + result.zoomDelta;
            if (targetZoom > map.getMinZoom() + 2) {
                const newPitch = Math.max(0, Math.min(60, (targetZoom - 10) * 10));
                if (map.transform) {
                    map.transform._pitch = newPitch * (Math.PI / 180);
                    map.triggerRepaint();
                }
            }
        }
        return result;
    };

}

// SET MARKERS  ----------------------------------------------------------------------------------------------------- //
const setMarkers = async (map: mapboxgl.Map, router: Router) => {

    Object.keys(venues).forEach(key => {

        // retrieve corresponding venue
        const venue = venues[key as keyof typeof venues]
        if (venue.location.longitude === null || venue.location.latitude === null) return;

        // retrieve corresponding sports
        let sports = [];
        if (venue && venue.sports && venue.sports.length > 0) {
            for (const sport of venue.sports) {
                sports.push({
                    "src": sport.icon,
                    "alt": sport.name
                });
            }
        }

        // create HTML element to contain marker
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.flexWrap = 'wrap';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease-in'

        // create new marker
        const markerCoordinates = [venue.location.longitude, venue.location.latitude] as [number, number];
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        }).setLngLat(markerCoordinates).addTo(map);
        markers.set(marker, markerCoordinates);
        markerDirections.set(marker, ref(0));

        // render marker in DOM
        const vnode = h(MarkerIcon, { sports: sports, direction: markerDirections.get(marker) });
        render(vnode, el);

        // make it appear if it is within the bounds
        const mapBounds = map.getBounds()!;
        const { paddedMapBounds: paddedMapBounds } = getPaddedMapBounds(mapBounds);
        if (paddedMapBounds.contains(markerCoordinates)) fadeInMarker(marker);

        // add click event
        marker.getElement().addEventListener('click', async () => {
            await flyToVenue(map, markerCoordinates);
            router.push(`/venue/${venue.slug}`);
        });
    });
};

// OUTSIDE MARKERS LOGIC  ------------------------------------------------------------------------------------------- //
const updateOutMarkers = (map: mapboxgl.Map, outMarkers: Map<Marker, Marker>, zoom: number, lastZoom: number) => {

    const mapBounds = map.getBounds()!;
    const { sw: sw, ne: ne, nw: nw, se: se, paddedMapBounds: paddedMapBounds } = getPaddedMapBounds(mapBounds);
    const { lng: mapLng, lat: mapLat } = map.getCenter();

    for (let marker of markers.keys()) {

        const coordinates = markers.get(marker);
        if (!coordinates) continue;
        const [markerLng, markerLat] = coordinates;

        if (!paddedMapBounds.contains([markerLng, markerLat])) {
            if (zoom <= 11) {
                const line = turf.lineString([[mapLng, mapLat], [markerLng, markerLat]]);
                let direction = turf.bearing(turf.point([mapLng, mapLat]), turf.point([markerLng, markerLat]));

                // handle special tahiti case
                if (markerLat < 0) direction *= 3;

                const viewportEdges = [
                    turf.lineString([nw, ne]),
                    turf.lineString([sw, se]),
                    turf.lineString([nw, sw]),
                    turf.lineString([ne, se])
                ];
                for (const edge of viewportEdges) {
                    const intersects = turf.intersect(line, edge);
                    if (intersects !== undefined) {
                        marker.setLngLat(intersects.geometry.coordinates as [number, number]);
                        markerDirections.get(marker)!.value = direction;
                        break;
                    }
                }
                if (lastZoom > 11) {
                    marker.addTo(map);
                    fadeInMarker(marker);
                }
            } else if (lastZoom <= 11) {
                removeMarker(marker);
            }
        } else {
            marker.addTo(map);
            markerDirections.get(marker)!.value = 0;
            marker.setLngLat([markerLng, markerLat]);
        };
    }
    return outMarkers;
}

// FLY TO VENUE LOGIC   --------------------------------------------------------------------------------------------- //
const flyToVenue = async (map: mapboxgl.Map, venueCoordinates: [number, number]) => {
    const { lng: lng, lat: lat } = map.getCenter();
    if (Math.abs(venueCoordinates[0] - lng) > 1 || Math.abs(venueCoordinates[1] - lat) > 1) {
        map.setMinZoom(undefined);
        // @ts-ignore
        map.setMaxBounds(undefined);
        await new Promise<void>(async (resolve): Promise<void> => {
            map.flyTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 4000,
                essential: true,
                curve: 2
            } as EasingOptions);
            map.once('moveend', () => resolve());
        }).catch(() => { });
        map.setMinZoom(10);
        map.setMaxBounds([
            [venueCoordinates[0] - 1, venueCoordinates[1] - 1],
            [venueCoordinates[0] + 1, venueCoordinates[1] + 1]
        ]);
    } else if (Math.abs(venueCoordinates[0] - lng) > 0.02 || Math.abs(venueCoordinates[1] - lat) > 0.02) {
        await new Promise<void>(async (resolve): Promise<void> => {
            map.flyTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 1500,
                essential: true,
                curve: 1
            } as EasingOptions);
            map.once('moveend', () => resolve());
        }).catch(() => { });
    } else {
        await new Promise<void>(async (resolve): Promise<void> => {
            map.easeTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 500,
            });
            map.once('moveend', () => resolve());
        }).catch(() => { });
    }
}


// GET PADDED MAP BOUNDS -------------------------------------------------------------------------------------------- //
const getPaddedMapBounds = (mapBounds: LngLatBounds, paddingFactor: number = 0.1) => {
    // sw and ne corners
    const { lng: swLng, lat: swLat } = mapBounds.getSouthWest();
    const { lng: neLng, lat: neLat } = mapBounds.getNorthEast();

    // adjusted w/ padding
    const latPadding = (neLat - swLat) * paddingFactor;
    const lngPadding = (neLng - swLng) * paddingFactor;

    const sw = [swLng + 1.5 * lngPadding, swLat + latPadding];
    const ne = [neLng - lngPadding, neLat - latPadding];
    const nw = [swLng + lngPadding, neLat - latPadding];
    const se = [neLng - lngPadding, swLat + latPadding];
    const paddedMapBounds = mapBounds.setNorthEast(ne as [number, number]).setSouthWest(sw as [number, number])

    return {
        sw: sw,
        ne: ne,
        nw: nw,
        se: se,
        paddedMapBounds: paddedMapBounds
    }
}

const removeMarker = (marker: mapboxgl.Marker) => {
    const el = marker.getElement();
    setTimeout(() => {
        el.style.opacity = '0';
        marker.remove();
    }, 500);

}

const fadeInMarker = (marker: mapboxgl.Marker) => {
    const el = marker.getElement();
    el.style.opacity = '0';
    setTimeout(() => {
        el.style.opacity = '1';
    }, 10);
};



export { setFinalProperties, setMarkers, updateOutMarkers, flyToVenue };