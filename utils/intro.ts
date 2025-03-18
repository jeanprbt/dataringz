import * as turf from "turf";
import * as d3 from "d3";
import type {LineString} from "geojson";

// ---------------------------------------------- FLY IN AND ROTATE ------------------------------------------------- //
const flyInAndRotate = async (
    map: mapboxgl.Map,
    targetLngLat: { lng: number; lat: number },
    duration: number,
    startZoom: number,
    endZoom: number,
    startBearing: number,
    endBearing: number,
    startPitch: number,
    endPitch: number,
): Promise<void> => {
    return new Promise(async (resolve) => {
        let start: number;
        let currentZoom: number;
        let currentBearing: number;
        let currentPitch: number;

        const frame = async (time: number): Promise<void> => {
            if (!start) start = time;
            let animationPhase = (time - start) / duration;
            if (animationPhase > 1) animationPhase = 1;

            currentZoom = startZoom + (endZoom - startZoom) * d3.easeCubicOut(animationPhase);
            currentBearing = startBearing + (endBearing - startBearing) * d3.easeCubicOut(animationPhase);
            currentPitch = startPitch + (endPitch - startPitch) * d3.easeCubicOut(animationPhase);

            map.easeTo({
                center: targetLngLat,
                zoom: currentZoom,
                bearing: currentBearing,
                pitch: currentPitch,
                duration: 0
            });

            if (animationPhase === 1) {
                resolve();
                return;
            }
            window.requestAnimationFrame(frame);
        };
        window.requestAnimationFrame(frame);
    });
};

// --------------------------------------------- ANIMATE PATH ------------------------------------------------------- //
const animatePath = async (
    map: mapboxgl.Map,
    duration: number,
    track: GeoJSON.Feature<LineString>,
    zoom: number,
    pitch: number,
    startBearing: number,
): Promise<number> => {
    return new Promise(async (resolve) => {
        const pathDistance = turf.lineDistance(track);
        let startTime: number;

        // store previous camera state for smoothing
        let prevLngLat: { lng: number, lat: number } | null = null;
        let prevBearing = startBearing;

        const SMOOTH_FACTOR = 0.15;

        const frame = async (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const animationPhase = (currentTime - startTime) / duration;

            // calculate the distance along the path based on the animationPhase
            const alongPath = (
                turf
                    .along(track, pathDistance * animationPhase)
                    .geometry
                    .coordinates
            );

            const targetLngLat = {
                lng: alongPath[0],
                lat: alongPath[1],
            };

            // interpolate bearing
            const targetBearing = startBearing - animationPhase * 250.0;
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
            map?.setPaintProperty(
                "line-layer",
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
            map?.easeTo({
                center: targetLngLat,
                bearing: prevBearing,
                pitch: pitch,
                zoom: zoom,
                duration: 0,
            });

            // Repeat!
            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    });
};

// ---------------------------------------- SMOOTHING FUNCTION  ----------------------------------------------------- //
const smootherstep = (start: number, end: number, t: number): number => {
    t = Math.max(0, Math.min(1, t));
    t = t * t * t * (t * (t * 6 - 15) + 10);
    return start + (end - start) * t;
};


export { flyInAndRotate, animatePath };
