import type { MapMouseEvent } from 'mapbox-gl';
import { type Router } from 'vue-router';
import countries from '~/data/countries.json';

let click: boolean = false;

let mouseMoveHandler: (e: MapMouseEvent) => void;
let mouseOutHandler: () => void;
let clickHandler: (e: MapMouseEvent) => void;


// FLY TO COUNTRY --------------------------------------------------------------------------------------------------- //
const flyToCountry = async (globe: mapboxgl.Map, countryCoordinates: [number, number]) => {
    const { lng, lat } = globe.getCenter();
    const zoom = globe.getZoom();
    if (Math.abs(lng - countryCoordinates[0]) < 1 && Math.abs(lat - countryCoordinates[1]) < 1 && Math.abs(zoom - 3.5) < 0.5) return;
    await new Promise<void>(async (resolve): Promise<void> => {
        globe.flyTo({
            center: countryCoordinates,
            zoom: 3.5,
            duration: 1500,
            essential: true,
            curve: 1
        });
        globe.once('moveend', () => resolve());
    }).catch(() => { });
}

// HANDLE HOVER (TOOLTIP + COUNTRY EXTRUSION) ----------------------------------------------------------------------- //
const settleGlobeCanvas = (globe: mapboxgl.Map, tooltipRef: Ref<HTMLElement>, router: Router) => {
    globe.setMinZoom(2);
    globe.setMaxZoom(3.5);
    mouseMoveHandler = (e: MapMouseEvent) => {
        if (click) return;
        const features = globe.queryRenderedFeatures(e.point, { layers: ["cf"] });
        if (features.length) {
            globe.setFilter("extrusion", ["==", "name", features[0].properties!.name]);
            const tooltip = tooltipRef.value;
            if (tooltip) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.point.x + 10}px`;
                tooltip.style.top = `${e.point.y + 10}px`;
                tooltip.innerText = features[0].properties!.name;
            }
        } else {
            globe.setFilter("extrusion", ["==", "name", ""]);
            const tooltip = tooltipRef.value;
            if (tooltip) tooltip.style.display = 'none';
        }
    }
    mouseOutHandler = () => {
        globe.setFilter("extrusion", ["==", "name", ""]);
        const tooltip = tooltipRef.value;
        if (tooltip) {
            tooltip.style.display = 'none';
        }

    }
    clickHandler = async (e: MapMouseEvent) => {
        const features = globe.queryRenderedFeatures(e.point, { layers: ["cf"] });
        if (features.length) {
            globe.setFilter("extrusion", ["==", "name", ""]);
            const tooltip = tooltipRef.value;
            if (tooltip) tooltip.style.display = 'none';
            const country = countries[features[0].properties!.slug as keyof typeof countries];
            click = true;
            await flyToCountry(globe, [country.location.longitude, country.location.latitude] as [number, number]);
            setTimeout(() => {
                click = false;
            }, 1000);
            router.push(`/country/${country.slug}`);
        }
    }
    globe.on("mousemove", mouseMoveHandler);
    globe.on("mouseout", mouseOutHandler);
    globe.on("click", clickHandler);
}

const unsettleGlobeCanvas = (globe: mapboxgl.Map) => {
    globe.setMinZoom(undefined);
    // @ts-ignore
    globe.setMaxZoom(undefined);
    globe.off('mousemove', mouseMoveHandler);
    globe.off("mouseout", mouseOutHandler);
    globe.off('click', clickHandler);
}

export { flyToCountry, settleGlobeCanvas, unsettleGlobeCanvas }; 
