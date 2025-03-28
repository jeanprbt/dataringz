import mapboxgl, { LngLatBounds, type Marker, type EasingOptions } from 'mapbox-gl';
import { type Router } from 'vue-router';
import * as turf from 'turf';

let markers = new Map<Marker, [number, number]>();

// SET FINAL PROPERTIES --------------------------------------------------------------------------------------------- //
const setFinalProperties = (map: mapboxgl.Map): void => {
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
    map.setMinZoom(10);
    map.setMaxBounds([
        [1.8080, 48.1217],
        [3.0079, 49.5094]
    ]);
    map.dragRotate.disable();

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
    const venues = await fetch('/data/venues.json').then(res => res.json());
    Object.keys(venues).forEach(key => {
        const venue = venues[key]

        if (venue.location.longitude === null || venue.location.latitude === null) return;

        // Create a custom HTML element for the marker
        const el = document.createElement('div');
        el.className = 'venue-marker';
        el.style.cursor = 'pointer';

        // Style the container
        el.style.display = 'flex';
        el.style.flexWrap = 'wrap';
        el.style.justifyContent = 'center';
        el.style.width = '50px';
        el.style.height = 'auto';
        el.style.background = 'rgba(255, 255, 255, 0.8)';
        el.style.borderRadius = '10px';
        el.style.padding = '5px';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease-in'

        // Add sports icons to the marker
        if (venue && venue.sports && venue.sports.length > 0) {
            // Add icons for each sport in the venue
            for (const sport of venue.sports) {
                const iconContainer = document.createElement('div');
                iconContainer.style.width = '30px';
                iconContainer.style.height = '30px';
                iconContainer.style.margin = '2px';

                const img = document.createElement('img');
                img.src = sport.icon;
                img.alt = sport.name;
                img.style.width = '100%';
                img.style.height = '100%';

                iconContainer.appendChild(img);
                el.appendChild(iconContainer);
            }
        } else {
            // Fallback for venues with no sports
            const defaultMarker = document.createElement('div');
            defaultMarker.style.width = '20px';
            defaultMarker.style.height = '20px';
            defaultMarker.style.borderRadius = '50%';
            defaultMarker.style.backgroundColor = '#FF0000';
            el.appendChild(defaultMarker);
        }


        // Create a new marker using the custom element
        const markerCoordinates = [venue.location.longitude, venue.location.latitude] as [number, number];
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        }).setLngLat(markerCoordinates).addTo(map);

        // Make it appear
        const mapBounds = map.getBounds()!;
        const { paddedMapBounds: paddedMapBounds } = getPaddedMapBounds(mapBounds);
        if (paddedMapBounds.contains(markerCoordinates)) fadeInMarker(marker);

        // Add click event
        marker.getElement().addEventListener('click', async () => {
            if (map.getZoom() <= 15) {
                await new Promise<void>(async (resolve): Promise<void> => {
                    map.flyTo({
                        center: markerCoordinates,
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 55,
                        duration: 1000,
                        essential: true,
                        curve: 1
                    } as EasingOptions);
                    map.once('moveend', () => resolve());
                }).catch(() => { });
            } else {
                await new Promise<void>(async (resolve, reject): Promise<void> => {
                    map.easeTo({
                        center: markerCoordinates,
                        zoom: 15.5,
                        bearing: 0,
                        pitch: 55,
                        duration: 500,
                    });
                    map.once('moveend', () => resolve());
                }).catch(() => { });
            }
            router.push(`/venue/${venue.slug}`);
        });

        // Register marker
        markers.set(marker, markerCoordinates);
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
                const viewportEdges = [
                    turf.lineString([nw, ne]),
                    turf.lineString([sw, se]),
                    turf.lineString([nw, sw]),
                    turf.lineString([ne, se])
                ];
                for (const edge of viewportEdges) {
                    const intersects = turf.intersect(line, edge);
                    if (intersects !== undefined) {
                        marker.setLngLat(intersects.geometry.coordinates as [number, number])
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
            marker.setLngLat([markerLng, markerLat]);
        };
    }
    return outMarkers;
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



export { setFinalProperties, setMarkers, updateOutMarkers };