import mapboxgl, { LngLatBounds, type Marker, type EasingOptions } from 'mapbox-gl';
import { type Router } from 'vue-router';
import * as turf from 'turf';
import { h, render } from 'vue';
import { MarkerIcon } from '#components';
import venues from '~/data/venues.json';

let markerCoordinates = new Map<Marker, [number, number]>();
const markerDirections = reactive(new Map<Marker, Ref<number>>());
const showMarkers = reactive(new Map<Marker, Ref<boolean>>());
const flyingMarkers = new Map<Marker, boolean>();

// SET FINAL PROPERTIES --------------------------------------------------------------------------------------------- //
const setFinalProperties = (map: mapboxgl.Map): void => {

    // remove intro lines
    _removeLayerAndSource(map, 'french-line-layer-1', 'french-line-1');
    _removeLayerAndSource(map, 'french-line-layer-2', 'french-line-2');
    _removeLayerAndSource(map, 'french-line-layer-3', 'french-line-3');
    _removeLayerAndSource(map, 'greek-line-layer', 'greel-line');

    // set final camera properties
    const { lng, lat } = map.getCenter();
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

        // create new marker
        const coords = [venue.location.longitude, venue.location.latitude] as [number, number];
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        }).setLngLat(coords).addTo(map);
        markerCoordinates.set(marker, coords);
        markerDirections.set(marker, ref(0));
        showMarkers.set(marker, ref(false));
        flyingMarkers.set(marker, false);

        // render marker in DOM
        const vnode = h(MarkerIcon, { sports: sports, show: showMarkers.get(marker), direction: markerDirections.get(marker) });
        render(vnode, el);

        // make it appear if it is within the bounds
        const mapBounds = map.getBounds()!;
        const { paddedMapBounds } = _getPaddedMapBounds(mapBounds);
        if (paddedMapBounds.contains(coords)) showMarkers.get(marker)!.value = true;

        // add click event
        marker.getElement().addEventListener('click', async () => {
            await flyToVenue(map, coords);
            router.push(`/venue/${venue.slug}`);
        });
    });
};

// OUTSIDE MARKERS LOGIC  ------------------------------------------------------------------------------------------- //
const updateMarkers = (map: mapboxgl.Map, zoom: number, lastZoom: number) => {

    const mapBounds = map.getBounds()!;
    const { sw, ne, nw, se, paddedMapBounds } = _getPaddedMapBounds(mapBounds);
    const { lng: mapLng, lat: mapLat } = map.getCenter();

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

// FLY TO VENUE LOGIC   --------------------------------------------------------------------------------------------- //
const flyToVenue = async (map: mapboxgl.Map, venueCoordinates: [number, number]) => {

    markerCoordinates.keys().forEach(m => {
        showMarkers.get(m)!.value = false;
        flyingMarkers.set(m, true);
    })

    const { lng, lat } = map.getCenter();
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

    setTimeout(() => {
        markerCoordinates.keys().forEach(m => {
            flyingMarkers.set(m, false);
        })
        updateMarkers(map, map.getZoom(), map.getZoom());
    }, 1500);
}


// FLY TO VENUE LOGIC   --------------------------------------------------------------------------------------------- //
const flyToCountry = async (globe: mapboxgl.Map, countryCoordinates: [number, number]) => {
    await new Promise<void>(async (resolve): Promise<void> => {
        globe.flyTo({
            center: countryCoordinates,
            zoom: 3.5,
            duration: 1500,
            essential: true,
            curve: 1
        } as EasingOptions);
        globe.once('moveend', () => resolve());
    }).catch(() => { });
}



// PRIVATE METHODS -------------------------------
const _removeLayerAndSource = (map: mapboxgl.Map, layerId: string, sourceId: string) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
};

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

export { setFinalProperties, setMarkers, updateMarkers, flyToVenue, flyToCountry };