import mapboxgl from "mapbox-gl";
import * as turf from "turf";
import * as d3 from "d3";

// ---------------------------------------------- FLY IN AND ROTATE ------------------------------------------------- //
const flyInAndRotate = async (
    map: mapboxgl.Map,
    targetLngLat: { lng: number; lat: number },
    duration: number,
    startAltitude: number,
    endAltitude: number,
    startBearing: number,
    endBearing: number,
    startPitch: number,
    endPitch: number,
): Promise<{ bearing: number; altitude: number }> => {
    return new Promise(async (resolve) => {
        let start: number;

        let currentAltitude: number;
        let currentBearing: number;
        let currentPitch: number;

        // the animation frame will run as many times as necessary until the duration has been reached
        const frame = async (time: number): Promise<void> => {
            if (!start) {
                start = time;
            }

            // otherwise, use the current time to determine how far along in the duration we are
            let animationPhase = (time - start) / duration;

            // because the phase calculation is imprecise, the final zoom can vary
            // if it ended up greater than 1, set it to 1 so that we get the exact endAltitude that was requested
            if (animationPhase > 1) {
                animationPhase = 1;
            }

            currentAltitude = startAltitude + (endAltitude - startAltitude) * d3.easeCubicOut(animationPhase)
            // rotate the camera between startBearing and endBearing
            currentBearing = startBearing + (endBearing - startBearing) * d3.easeCubicOut(animationPhase)

            currentPitch = startPitch + (endPitch - startPitch) * d3.easeCubicOut(animationPhase)

            // compute corrected camera ground position, so the start of the path is always in view
            let correctedPosition = computeCameraPosition(
                currentPitch,
                currentBearing,
                targetLngLat,
                currentAltitude
            );

            // set the pitch and bearing of the camera
            const camera = map?.getFreeCameraOptions();
            camera?.setPitchBearing(currentPitch, currentBearing);

            // set the position and altitude of the camera
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                correctedPosition,
                currentAltitude
            );

            // apply the new camera options
            map?.setFreeCameraOptions(camera);

            // when the animationPhase is done, resolve the promise so the parent function can move on to the next step in the sequence
            if (animationPhase === 1) {
                resolve({
                    bearing: currentBearing,
                    altitude: currentAltitude,
                });
                // return so there are no further iterations of this frame
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
    track: GeoJSON.Feature<GeoJSON.LineString>,
    startBearing: number,
    startAltitude: number,
    pitch: number,
): Promise<number> => {
    return new Promise(async (resolve) => {
        const pathDistance = turf.lineDistance(track);
        let startTime: number;

        const frame = async (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const animationPhase = (currentTime - startTime) / duration;


            // calculate the distance along the path based on the animationPhase
            const alongPath = (
                turf
                    .along(track, pathDistance * animationPhase)
                    .geometry
                    .   coordinates
            );

            const lngLat = {
                lng: alongPath[0],
                lat: alongPath[1],
            };

            // slowly rotate the map at a constant rate
            const bearing = startBearing - animationPhase * 250.0;

            // when the duration is complete, resolve the promise and stop iterating
            if (animationPhase > 1) {
                resolve(bearing);
                return;
            }

            // Reduce the visible length of the line by using a line-gradient to cut off the line
            // animationPhase is a value between 0 and 1 that represents the progress of the animation
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

            // compute corrected camera ground position, so that the leading edge of the path is in view
            let correctedPosition = computeCameraPosition(
                pitch,
                bearing,
                lngLat,
                startAltitude,
                true
            );

            // set the pitch and bearing of the camera
            const camera = map?.getFreeCameraOptions();
            camera?.setPitchBearing(pitch, bearing);

            // set the position and altitude of the camera
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                correctedPosition,
                startAltitude
            );

            // apply the new camera options
            map?.setFreeCameraOptions(camera);

            // repeat!
            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    });
};


// ------------------------------------------ GET ALTITUDE FROM ZOOM ------------------------------------------------ //
function getAltitudeFromZoom(
    map: mapboxgl.Map,
    zoom: number,
    lat: number,
    pitch: number,
): number {
    const pitchInRadians = pitch * (Math.PI / 180);
    const cameraToCenterDistance = (0.5 / Math.tan(map.transform.fov / 2)) * map.transform.height;
    const pixelAltitude = Math.abs(Math.cos(pitchInRadians) * cameraToCenterDistance);

    const circumferenceAtEquator = 2 * Math.PI * 6378137;
    const metersInWorldAtLat = circumferenceAtEquator * Math.abs(Math.cos(lat * (Math.PI / 180)));

    const worldsize = map.transform.tileSize * Math.pow(2, zoom);
    return (pixelAltitude * metersInWorldAtLat) / worldsize;
}

// -------------------------------------- COMPUTE CAMERA POSITION --------------------------------------------------- //
// given a bearing, pitch, altitude, and a targetPosition on the ground to look at,
// calculate the camera's targetPosition as lngLat
let previousCameraPosition: { lng: number, lat: number } | undefined = undefined
const computeCameraPosition = (
    pitch: number,
    bearing: number,
    targetPosition: { lng: number, lat: number },
    altitude: number,
    smooth = false
): { lng: number, lat: number } => {
    let bearingInRadian = bearing / 57.29;
    let pitchInRadian = (90 - pitch) / 57.29;

    let lngDiff =
        ((altitude / Math.tan(pitchInRadian)) *
            Math.sin(-bearingInRadian)) /
        70000; // ~70km/degree longitude
    let latDiff =
        ((altitude / Math.tan(pitchInRadian)) *
            Math.cos(-bearingInRadian)) /
        110000; // 110km/degree latitude

    let correctedLng = targetPosition.lng + lngDiff;
    let correctedLat = targetPosition.lat - latDiff;

    const newCameraPosition = {
        lng: correctedLng,
        lat: correctedLat
    };

    if (smooth) {
        if (previousCameraPosition) {
            const SMOOTH_FACTOR = 0.97
            newCameraPosition.lng = lerp(newCameraPosition.lng, previousCameraPosition.lng, SMOOTH_FACTOR);
            newCameraPosition.lat = lerp(newCameraPosition.lat, previousCameraPosition.lat, SMOOTH_FACTOR);
        }
    }

    previousCameraPosition = newCameraPosition

    return newCameraPosition
};

// --------------------------------------------------- LERP --------------------------------------------------------- //
// see https://codepen.io/ma77os/pen/OJPVrP
const lerp = (start: number, end: number, amt: number): number => {
    return (1 - amt) * start + amt * end
}


export { flyInAndRotate, animatePath, getAltitudeFromZoom };