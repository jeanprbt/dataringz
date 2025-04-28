import * as turf from "turf";
import type { Feature, LineString } from "geojson";
import type { Map, EasingOptions } from "mapbox-gl";

import { displayText } from "~/utils/animations";
import { 
    olympia, 
    marseille,
    bastia, 
    perpignan, 
    guiana, 
    caledonia, 
    reunion, 
    polynesia, 
    guadeloupe, 
    martinique, 
    nice, 
    paris, 
    path 
} from '~/utils/constants';

const geojsonFiles = import.meta.glob('/data/*.geojson', { as: 'raw' });
const trackFrance1 = JSON.parse(await geojsonFiles['/data/track_france_1.geojson']());
const trackFrance2 = JSON.parse(await geojsonFiles['/data/track_france_2.geojson']());
const trackFrance3 = JSON.parse(await geojsonFiles['/data/track_france_3.geojson']());
const trackGreece = JSON.parse(await geojsonFiles['/data/track_greece.geojson']());

// PLAY INTRO ------------------------------------------------------------------------------------------------------- //
const playIntro = async (
    map: Map, 
    signal: AbortSignal, 
    showText: Ref,
    textContainer: Ref, 
    currentText: Ref
): Promise<void> => {
    signal.throwIfAborted();

    if (signal.aborted) return;

    // ADD LINES ---------------------------------------------------------------------------------------------------- //
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
    map.addSource("french-line-3", {
        type: "geojson",
        lineMetrics: true,
        data: trackFrance3,
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
        id: "french-line-layer-3",
        type: "line",
        source: "french-line-3",
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

    // FLY TO OLYMPIA ------------------------------------------------------------------------------------------------//
    await new Promise<void>(async (resolve, reject): Promise<void> => {
        if (signal.aborted) return reject();
        map.flyTo({ ...olympia, duration: 2000, essential: true, curve: 1 } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => {});

    displayText(
        showText, 
        textContainer, 
        currentText, 
        "Our journey begins in Olympia, Greece, where the Olympic flame has been lit before each Games since 1936.\
        It then travels to Athens, where it boards the Bélèm to cross the Mediterranean Sea to Marseille.", 4
    );

    // ANIMATE GREEK TRACK ------------------------------------------------------------------------------------------ //
    await animatePath({
        map: map,
        duration: 4000,
        track: trackGreece,
        layerId: "greek-line-layer",
        signal: signal,
        ...path,
    } as AnimatePathOptions);


    // FLY TO MARSEILLE --------------------------------------------------------------------------------------------- //
    await new Promise<void>(async (resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({ ...marseille, duration: 2000, essential: true, curve: 1 } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => { });

    displayText(
        showText, 
        textContainer, 
        currentText, 
        "The flame crosses the South of France for six days...", 1.5
    );

    // ANIMATE FRENCH TRACK PT. 1 ----------------------------------------------------------------------------------- //
    await animatePath({
        map: map,
        duration: 2000,
        track: trackFrance1,
        layerId: "french-line-layer-1",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    displayText(
        showText, 
        textContainer, 
        currentText, 
        "...before reaching Bastia, Corsica.", 2
    );

    // FLY TO BASTIA ------------------------------------------------------------------------------------------------ //
    for (const location of [bastia, perpignan]) {
        await new Promise<void>(async (resolve, reject) => {
            if (signal.aborted) return reject();
            map.flyTo({ ...location, duration: 2000, essential: true, curve: 1 } as EasingOptions);
            map.once('moveend', () => resolve());
        }).catch(() => {});
    }
    
    displayText(
        showText, 
        textContainer, 
        currentText, 
        "It spends the next three weeks travelling up the west of France, sometimes crossing more than one departement a day!", 3
    );

    // ANIMATE FRENCH TRACK PT. 2 ----------------------------------------------------------------------------------- //
    await animatePath({
        map: map,
        duration: 6000,
        track: trackFrance2,
        layerId: "french-line-layer-2",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    displayText(
        showText, 
        textContainer, 
        currentText, 
        "The Olympic symbol will even be visiting all the French overseas departments, starting with French Guiana, ...", 2
    );
    await new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({ ...guiana, duration: 3000, essential: true, curve: 1 } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => { });


    // FLY TO DOM-TOM ----------------------------------------------------------------------------------------------- //
    const locations = [caledonia, reunion, polynesia, guadeloupe, martinique];
    for (const location of locations) {
        displayText(
            showText, 
            textContainer, 
            currentText, 
            `${location.name}...`, 1
        );
        await new Promise<void>((resolve, reject) => {
            if (signal.aborted) return reject();
            map.flyTo({ ...location, duration: 2000, essential: true, curve: 1 } as EasingOptions);
            map.once('moveend', () => resolve());
        }).catch(() => { });
    }

    // FLY BACK TO NICE --------------------------------------------------------------------------------------------- //
    displayText(
        showText, 
        textContainer, 
        currentText, 
        "And then back to Nice, for the end of the route towards Paris!", 2
    );
    await new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({ ...nice, duration: 2000, essential: true, curve: 1 } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => { });

    // ANIMATE FRENCH TRACK PT.3 ------------------------------------------------------------------------------------ //
    await animatePath({
        map: map,
        duration: 8000,
        track: trackFrance3,
        layerId: "french-line-layer-3",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    displayText(
        showText, 
        textContainer, 
        currentText, 
        "Let the Olympics begin!", 2
    );

    // FLY TO PARIS ------------------------------------------------------------------------------------------------- //
    await new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({ ...paris, duration: 4000, essential: true, curve: 1 } as EasingOptions);
        map.once('moveend', () => resolve());
    }).catch(() => { });
}



// ANIMATE PATH ----------------------------------------------------------------------------------------------------- //
type AnimatePathOptions = {
    map: Map;
    duration: number;
    track: Feature<LineString>;
    layerId: string;
    zoom: number;
    pitch: number;
    bearing: number;
    signal: AbortSignal;
}
const animatePath = async (options: AnimatePathOptions): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        if (options.signal.aborted) return reject();
        const pathDistance = turf.lineDistance(options.track);
        let startTime: number;

        // store previous camera state for smoothing
        let prevLngLat: { lng: number, lat: number } | null = null;
        let prevBearing = options.bearing;

        const SMOOTH_FACTOR = 0.15;

        const frame = async (currentTime: number) => {
            if (options.signal.aborted) return reject();
            if (!startTime) startTime = currentTime;
            const animationPhase = (currentTime - startTime) / options.duration;

            // calculate the distance along the path based on the animationPhase
            const alongPath = (
                turf
                    .along(options.track, pathDistance * animationPhase)
                    .geometry
                    .coordinates
            );

            const targetLngLat = {
                lng: alongPath[0],
                lat: alongPath[1],
            };

            // interpolate bearing
            const targetBearing = options.bearing - animationPhase * 100.0;
            prevBearing = smootherstep(prevBearing, targetBearing, SMOOTH_FACTOR);

            // interpolate position
            if (prevLngLat) {
                targetLngLat.lng = smootherstep(prevLngLat.lng, targetLngLat.lng, SMOOTH_FACTOR);
                targetLngLat.lat = smootherstep(prevLngLat.lat, targetLngLat.lat, SMOOTH_FACTOR);
            }
            prevLngLat = targetLngLat;

            // When the duration is complete, resolve the promise and stop iterating
            if (animationPhase > 1) {
                resolve(prevBearing);
                return;
            }

            // Reduce the visible length of the line by using a line-gradient to cut off the line
            options.map.setPaintProperty(
                options.layerId,
                "line-gradient",
                [
                    "step",
                    ["line-progress"],
                    "red",
                    animationPhase,
                    "rgba(0, 0, 0, 0)",
                ]
            );

            // Move the camera smoothly
            options.map.easeTo({
                center: targetLngLat,
                bearing: prevBearing,
                pitch: options.pitch,
                zoom: options.zoom,
                duration: 0,
            });

            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    });
}


// SMOOTHING FUNCTION  ---------------------------------------------------------------------------------------------- //
const smootherstep = (start: number, end: number, t: number): number => {
    t = Math.max(0, Math.min(1, t));
    t = t * t * t * (t * (t * 6 - 15) + 10);
    return start + (end - start) * t;
};

export { playIntro };
