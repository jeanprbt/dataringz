import { LngLatBounds, Marker, type EasingOptions } from 'mapbox-gl';
import { type Router } from 'vue-router';
import * as turf from 'turf';
import { h, render } from 'vue';
import { MarkerIcon } from '#components';
import venues from '~/data/venues.json';

let markerCoordinates = new Map<Marker, [number, number]>();
const markerDirections = reactive(new Map<Marker, Ref<number>>());
const showMarkers = reactive(new Map<Marker, Ref<boolean>>());
const flyingMarkers = new Map<Marker, boolean>();

// MARKERS LOGIC  --------------------------------------------------------------------------------------------------- //
const setMarkers = async (canvas: mapboxgl.Map, router: Router) => {

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

        // create new marker
        const coords = [venue.location.longitude, venue.location.latitude] as [number, number];
        const marker = new Marker({
            element: el,
            anchor: 'center'
        }).setLngLat(coords).addTo(canvas);
        markerCoordinates.set(marker, coords);
        markerDirections.set(marker, ref(0));
        showMarkers.set(marker, ref(false));
        flyingMarkers.set(marker, false);

        // render marker in DOM
        const vnode = h(MarkerIcon, { sports: sports, show: showMarkers.get(marker), direction: markerDirections.get(marker) });
        render(vnode, el);

        // make it appear if it is within the bounds
        const mapBounds = canvas.getBounds()!;
        const { paddedMapBounds } = _getPaddedMapBounds(mapBounds);
        if (paddedMapBounds.contains(coords)) showMarkers.get(marker)!.value = true;

        // add click event
        marker.getElement().addEventListener('click', async () => {
            await flyToVenue(canvas, coords);
            router.push(`/venue/${venue.slug}`);
        });
    });
};

const updateMarkers = (canvas: mapboxgl.Map, zoom: number, lastZoom: number) => {

    const mapBounds = canvas.getBounds()!;
    const { sw, ne, nw, se, paddedMapBounds } = _getPaddedMapBounds(mapBounds);
    const { lng: mapLng, lat: mapLat } = canvas.getCenter();

    for (let marker of markerCoordinates.keys()) {

        if (flyingMarkers.get(marker)) continue;

        const coordinates = markerCoordinates.get(marker);
        if (!coordinates) continue;
        const [markerLng, markerLat] = coordinates;

        if (paddedMapBounds.contains([markerLng, markerLat])) {
            showMarkers.get(marker)!.value = true;
            markerDirections.get(marker)!.value = 0;
            marker.setLngLat([markerLng, markerLat]);
            continue;
        }

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
                showMarkers.get(marker)!.value = true;
            }
        } else if (lastZoom <= 11) {
            showMarkers.get(marker)!.value = false;
        }

    }
}

// MAP LOGIC ------------------------------------------------------------------------------------------------ //
const settleCanvas = (canvas: mapboxgl.Map): void => {
    // zoom & bounds
    const { lng, lat } = canvas.getCenter();
    canvas.setMinZoom(10);
    canvas.setMaxBounds([
        [lng - 1, lat - 1],
        [lng + 1, lat + 1]
    ]);

    // set initial pitch based on zoom
    const initialZoom = canvas.getZoom();
    canvas.setPitch(Math.max(0, Math.min(60, (initialZoom - 10) * 10)));

    // override scrollZoom renderFrame to add pitch updates
    const scrollZoom = canvas.scrollZoom as any;
    const originalRenderFrame = scrollZoom.renderFrame;
    scrollZoom.renderFrame = function () {
        const result = originalRenderFrame.call(this);
        if (result?.zoomDelta) {
            const targetZoom = canvas.getZoom() + result.zoomDelta;
            if (targetZoom > canvas.getMinZoom() + 2) {
                const newPitch = Math.max(0, Math.min(60, (targetZoom - 10) * 10));
                if (canvas.transform) {
                    canvas.transform._pitch = newPitch * (Math.PI / 180);
                    canvas.triggerRepaint();
                }
            }
        }
        return result;
    };
}

const flyToVenue = async (canvas: mapboxgl.Map, venueCoordinates: [number, number]) => {

    markerCoordinates.keys().forEach(m => {
        showMarkers.get(m)!.value = false;
        flyingMarkers.set(m, true);
    })

    const { lng, lat } = canvas.getCenter();
    if (Math.abs(venueCoordinates[0] - lng) > 1 || Math.abs(venueCoordinates[1] - lat) > 1) {
        canvas.setMinZoom(undefined);
        // @ts-ignore
        canvas.setMaxBounds(undefined);
        await new Promise<void>(async (resolve): Promise<void> => {
            canvas.flyTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 4000,
                essential: true,
                curve: 2
            } as EasingOptions);
            canvas.once('moveend', () => resolve());
        }).catch(() => { });
        canvas.setMinZoom(10);
        canvas.setMaxBounds([
            [venueCoordinates[0] - 1, venueCoordinates[1] - 1],
            [venueCoordinates[0] + 1, venueCoordinates[1] + 1]
        ]);
    } else if (Math.abs(venueCoordinates[0] - lng) > 0.02 || Math.abs(venueCoordinates[1] - lat) > 0.02) {
        await new Promise<void>(async (resolve): Promise<void> => {
            canvas.flyTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 1500,
                essential: true,
                curve: 1
            } as EasingOptions);
            canvas.once('moveend', () => resolve());
        }).catch(() => { });
    } else {
        await new Promise<void>(async (resolve): Promise<void> => {
            canvas.easeTo({
                center: venueCoordinates,
                zoom: 15.5,
                bearing: 0,
                pitch: 55,
                duration: 500,
            });
            canvas.once('moveend', () => resolve());
        }).catch(() => { });
    }

    setTimeout(() => {
        markerCoordinates.keys().forEach(m => {
            flyingMarkers.set(m, false);
        })
        updateMarkers(canvas, canvas.getZoom(), canvas.getZoom());
    }, 1500);
}

// PRIVATE METHODS -------------------------------
const _getPaddedMapBounds = (mapBounds: LngLatBounds, paddingFactor: number = 0.1) => {
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

export { setMarkers, updateMarkers, settleCanvas, flyToVenue };