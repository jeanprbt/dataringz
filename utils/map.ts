import mapboxgl, { LngLatBounds, Marker, type EasingOptions } from 'mapbox-gl';
import { type Router } from 'vue-router';
import * as turf from 'turf';
import { h, render } from 'vue';
import { MarkerIcon } from '#components';

import sports from '~/data/sports.json';
import venues from '~/data/venues.json';

let markerCoordinates = new Map<Marker, [number, number]>();
const markerDirections = reactive(new Map<Marker, Ref<number>>());
const showMarkers = reactive(new Map<Marker, Ref<boolean>>());
const staticMarkers = new Map<Marker, boolean>();

// MARKERS LOGIC  --------------------------------------------------------------------------------------------------- //
const setMarkers = async (map: mapboxgl.Map, router: Router, visible: boolean = true) => {

    Object.keys(venues).forEach(key => {

        // retrieve corresponding venue
        const venue = venues[key as keyof typeof venues]
        if (venue.location.longitude === null || venue.location.latitude === null) return;

        // retrieve corresponding sports
        let venueSports = [];
        if (venue && venue.sports && venue.sports.length > 0) {
            for (const sportSlug of venue.sports) {
                const sport = sports[sportSlug as keyof typeof sports] as any;
                venueSports.push({
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
        }).setLngLat(coords).addTo(map);

        // create popup for venue name
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, - (venueSports.length * (15 + 2))],
            className: 'venue-popup'
        }).setHTML(`<div class="text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-white px-2 py-1 rounded">${venue.name}</div>`);

        marker.setPopup(popup);
        marker.getElement().addEventListener('mouseenter', () => popup.addTo(map));
        marker.getElement().addEventListener('mouseleave', () => popup.remove());

        // change popup style
        const style = document.createElement('style');
        style.textContent = `
            .venue-popup .mapboxgl-popup-content {
                padding: 0;
                background: transparent;
                box-shadow: none;
            }
            .venue-popup .mapboxgl-popup-tip {
                border-top-color: rgb(244 244 245);
                width: 12px;
                height: 12px;
                border-width: 6px;
            }
            
            @media (prefers-color-scheme: dark) {
                .venue-popup .mapboxgl-popup-tip {
                    border-top-color: rgb(63, 63, 70);
                }
            }

            @media (max-width: 767px) {
                .venue-popup {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        markerCoordinates.set(marker, coords);
        markerDirections.set(marker, ref(0));
        showMarkers.set(marker, ref(false));
        staticMarkers.set(marker, false);

        // render marker in DOM
        const vnode = h(MarkerIcon, { sports: venueSports, show: showMarkers.get(marker), direction: markerDirections.get(marker) });
        render(vnode, el);

        // make it appear if it is within the bounds
        if (visible) {
            const mapBounds = map.getBounds()!;
            const { paddedMapBounds } = _getPaddedMapBounds(mapBounds);
            if (paddedMapBounds.contains(coords)) showMarkers.get(marker)!.value = true;
        }

        // add click event
        marker.getElement().addEventListener('click', async () => {
            await flyToVenue(map, coords);
            router.push(`/venue/${venue.slug}`);
        });
    });

    if (!visible) {
        removeMarkers();
    }
};

const updateMarkers = (map: mapboxgl.Map, zoom: number, lastZoom: number) => {

    const mapBounds = map.getBounds()!;
    const { sw, ne, nw, se, paddedMapBounds } = _getPaddedMapBounds(mapBounds);
    const { lng: mapLng, lat: mapLat } = map.getCenter();

    for (let marker of markerCoordinates.keys()) {

        if (staticMarkers.get(marker)) continue;

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
            if (markerLat < 0 && mapLat > 0) direction *= 3;

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

const removeMarkers = () => {
    for (const marker of markerCoordinates.keys()) {
        showMarkers.get(marker)!.value = false;
        staticMarkers.set(marker, true);
    }
}

const addMarkers = () => {
    for (const marker of markerCoordinates.keys()) {
        showMarkers.get(marker)!.value = true;
        staticMarkers.set(marker, false);
    }
}

// MAP LOGIC ------------------------------------------------------------------------------------------------ //
const settleMapCanvas = (map: mapboxgl.Map): void => {
    // zoom & bounds
    const { lng, lat } = map.getCenter();
    map.setMinZoom(10);
    map.setMaxZoom(16);
    map.setMaxBounds([
        [lng - 1, lat - 1],
        [lng + 1, lat + 1]
    ]);
}

const unsettleMapCanvas = (map: mapboxgl.Map): void => {
    map.setMinZoom(undefined);
    // @ts-ignore
    map.setMaxBounds(undefined);
}


const flyToVenue = async (map: mapboxgl.Map, venueCoordinates: [number, number]) => {

    for (const marker of markerCoordinates.keys()) {
        showMarkers.get(marker)!.value = false;
        staticMarkers.set(marker, true);
    }

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
        for (const marker of markerCoordinates.keys()) {
            staticMarkers.set(marker, false);
        }
        updateMarkers(map, map.getZoom(), map.getZoom());
    }, 1500);
}

// PRIVATE METHODS -------------------------------
const _getPaddedMapBounds = (mapBounds: LngLatBounds, paddingFactor: number = 0.12) => {
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

export { setMarkers, updateMarkers, addMarkers, removeMarkers, settleMapCanvas, unsettleMapCanvas, flyToVenue };