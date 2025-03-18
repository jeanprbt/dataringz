import { computeCameraPosition } from "./flyInAndRotate.ts";
import mapboxgl from "mapbox-gl";
import * as turf from "turf";

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
            map!.setPaintProperty(
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
            const camera = map.getFreeCameraOptions();
            camera.setPitchBearing(pitch, bearing);

            // set the position and altitude of the camera
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                correctedPosition,
                startAltitude
            );

            // apply the new camera options
            map.setFreeCameraOptions(camera);

            // repeat!
            window.requestAnimationFrame(frame);
        };

        window.requestAnimationFrame(frame);
    });
};

export {animatePath};