import * as turf from "turf";
import type {Feature, LineString} from "geojson";
import type {Map, EasingOptions} from "mapbox-gl";

// PLAY INTRO ------------------------------------------------------------------------------------------------------- //
const playIntro = async (map: Map, signal: AbortSignal): Promise<void> => {
    signal.throwIfAborted();

    // LOAD TRACKS -------------------------------------------------------------------------------------------------- //
    const trackFrance1: Feature<LineString> = (
        await fetch('/geojson/track_france_1.geojson').then((res) => res.json())
    );
    const trackFrance2: Feature<LineString> = (
        await fetch('/geojson/track_france_2.geojson').then((res) => res.json())
    );
    const trackGreece: Feature<LineString> = (
        await fetch('/geojson/track_greece.geojson').then((res) => res.json())
    )

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
        map.flyTo({
            ...olympia,
            duration: 2000,
            essential: true,
            curve: 1,
        } as EasingOptions);
        map.once('moveend', resolve);
    }).catch(() => {});

    // ANIMATE GREEK TRACK ------------------------------------------------------------------------------------------ //
    await animatePath({
        map: map,
        duration: 2000,
        track: trackGreece,
        layerId: "greek-line-layer",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    // FLY TO MARSEILLE --------------------------------------------------------------------------------------------- //
    await new Promise<void>(async (resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({
            ...marseille,
            duration: 2000,
            essential: true,
            curve: 1,
        } as EasingOptions);
        map.once('moveend', resolve);
    }).catch(() => {});

    // ANIMATE FRENCH TRACK PT. 1 ----------------------------------------------------------------------------------- //
    await animatePath({
        map: map,
        duration: 10000,
        track: trackFrance1,
        layerId: "french-line-layer-1",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    // FLY TO DOM-TOM ----------------------------------------------------------------------------------------------- //
    const locations = [guiana, caledonia, reunion, polynesia, guadeloupe, martinique, nice];
    for (const location of locations) {
        await new Promise<void>((resolve, reject) => {
            if (signal.aborted) return reject();
            map.flyTo({ ...location, duration: 2000, essential: true, curve: 1 } as EasingOptions);
            map.once('moveend', resolve);
        }).catch(() => {});
    }

    // ANIMATE FRENCH TRACK PT.2 ------------------------------------------------------------------------------------ //
    await animatePath({
        map: map,
        duration: 10000,
        track: trackFrance2,
        layerId: "french-line-layer-2",
        signal: signal,
        ...path,
    } as AnimatePathOptions);

    // FLY TO PARIS ------------------------------------------------------------------------------------------------- //
    await new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject();
        map.flyTo({
            ...paris,
            duration: 2000,
            essential: true,
            curve: 1,
        } as EasingOptions);
        map.once('moveend', resolve);
    }).catch(() => {});

    setFinalProperties(map);
}


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

    // map zoom range [10 -> 16] to pitch range [0 -> 60]
    map.on('zoom', () => {
        const zoom = map!.getZoom();
        const pitch = (zoom - 10) * 10;
        map.setPitch(pitch);
    })
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

// LOCATIONS -------------------------------------------------------------------------------------------------------- //
type IntroLocation = {
    center: [number, number],
    zoom: number,
    pitch: number,
    bearing: number,
}
const olympia: IntroLocation = {
    center: [21.6250, 37.6362],
    zoom: 7,
    bearing: 340,
    pitch: 50
}
const marseille: IntroLocation = {
    center: [5.37401, 43.29613],
    zoom: 7,
    bearing: 340,
    pitch: 50
}
const guiana: IntroLocation = {
    center: [-52.326000, 4.937200],
    zoom: 5,
    bearing: 320,
    pitch: 30
}
const caledonia: IntroLocation = {
    center: [166.457993, -22.275801],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const reunion: IntroLocation = {
    center: [55.448101, -20.878901],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const polynesia: IntroLocation = {
    center: [-149.569595, -17.535000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const guadeloupe: IntroLocation = {
    center: [-61.580002, 16.270000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const martinique: IntroLocation = {
    center: [-61.083302, 14.600000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const nice: IntroLocation = {
    center:  [7.26189, 43.71021],
    zoom: 7,
    bearing: 340,
    pitch: 50
}

// EXPORTS ---------------------------------------------------------------------------------------------------------- //
const path = {
    zoom: 7,
    bearing: 340,
    pitch: 50,
}
const paris: IntroLocation = {
    center: [2.294694, 48.858093],
    zoom: 15.5,
    bearing: 0,
    pitch: 55,
}
const start: IntroLocation = {
    center: [5, 43],
    zoom: 2,
    pitch: 0,
    bearing: 400
}

export {
    playIntro, setFinalProperties, start, paris, path
};
