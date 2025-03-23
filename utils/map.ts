import type { FeatureCollection, Point } from 'geojson';
import mapboxgl, { type Map } from 'mapbox-gl';
import { type Router } from 'vue-router';

// SET FINAL PROPERTIES --------------------------------------------------------------------------------------------- //
const setFinalProperties = (map: Map): void => {
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
        [2.0575, 48.7908],
        [2.5279, 48.9494]
    ]);
    map.dragRotate.disable();

    // set initial pitch based on zoom
    const initialZoom = map.getZoom();
    map.setPitch(Math.max(0, Math.min(60, (initialZoom - 10) * 10)));
    
    // override scrollZoom renderFrame to add pitch updates
    const scrollZoom = map.scrollZoom as any;
    const originalRenderFrame = scrollZoom.renderFrame;
    
    scrollZoom.renderFrame = function() {
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
const setMarkers = async (map: Map, router: Router, venues: FeatureCollection<Point>) => {

    const venuesData = await fetch('/data/venues.json').then(res => res.json());

    venues.features.forEach((venue)=> {
        const venueSlug = venue.properties!.slug;
        const venueInfo = venuesData[venueSlug];

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

        // Add sports icons to the marker
        if (venueInfo && venueInfo.sports && venueInfo.sports.length > 0) {
            // Add icons for each sport in the venue
            for (const sport of venueInfo.sports) {
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
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        })
            .setLngLat(venue.geometry.coordinates as [number, number])
            .addTo(map);

        // Add click event
        marker.getElement().addEventListener('click', () => {
            router.push(`/venue/${venueSlug}`);
        });
    });
};

export { setFinalProperties, setMarkers };