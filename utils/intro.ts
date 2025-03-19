import * as turf from "turf";
import type {Feature, LineString} from "geojson";
import type {Map} from "mapbox-gl";

// ANIMATE PATH ----------------------------------------------------------------------------------------------------- //
type AnimatePathOptions = {
    map: Map;
    duration: number;
    track: Feature<LineString>;
    layerId: string;
    zoom: number;
    pitch: number;
    bearing: number;
}
const animatePath = async (options: AnimatePathOptions): Promise<number> => {
    return new Promise(async (resolve) => {
        const pathDistance = turf.lineDistance(options.track);
        let startTime: number;

        // store previous camera state for smoothing
        let prevLngLat: { lng: number, lat: number } | null = null;
        let prevBearing = options.bearing;

        const SMOOTH_FACTOR = 0.15;

        const frame = async (currentTime: number) => {
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

// EXPORTS  --------------------------------------------------------------------------------------------------------- //
const start = {
    center: [5, 43],
    zoom: 2,
    pitch: 0,
    bearing: 400
}

const olympia = {
    center: [21.6250, 37.6362],
    zoom: 7,
    bearing: 340,
    pitch: 50
}

const marseille = {
    center: [5.37401, 43.29613],
    zoom: 7,
    bearing: 340,
    pitch: 50
}

const paris = {
    center: [2.294694, 48.858093],
    zoom: 15.5,
    bearing: 0,
    pitch: 55,
}

const path = {
    zoom: 7,
    bearing: 340,
    pitch: 50,
}

const guiana = {
    center: [-52.326000, 4.937200],
    zoom: 5,
    bearing: 320,
    pitch: 30
}

const caledonia = {
    center: [166.457993, -22.275801],
    zoom: 5,
    bearing: 340,
    pitch: 30
}

const reunion = {
    center: [55.448101, -20.878901],
    zoom: 5,
    bearing: 340,
    pitch: 30
}

const polynesia = {
    center: [-149.569595, -17.535000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}

const guadeloupe = {
    center: [-61.580002, 16.270000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}

const martinique = {
    center: [-61.083302, 14.600000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}

const nice = {
    center:  [7.26189, 43.71021],
    zoom: 7,
    bearing: 340,
    pitch: 50
}

export {
    animatePath,
    type AnimatePathOptions,
    start,
    olympia,
    marseille,
    paris,
    path,
    guiana,
    caledonia,
    reunion,
    polynesia,
    guadeloupe,
    martinique,
    nice
};
