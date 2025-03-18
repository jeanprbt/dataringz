import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

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
            const camera = map.getFreeCameraOptions();
            camera.setPitchBearing(currentPitch, currentBearing);

            // set the position and altitude of the camera
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                correctedPosition,
                currentAltitude
            );

            // apply the new camera options
            map!.setFreeCameraOptions(camera);

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

// given a bearing, pitch, altitude, and a targetPosition on the ground to look at,
// calculate the camera's targetPosition as lngLat
let previousCameraPosition: { lng: number, lat: number } | undefined = undefined

// amazingly simple, via https://codepen.io/ma77os/pen/OJPVrP
function lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end
}

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


export {computeCameraPosition, flyInAndRotate};