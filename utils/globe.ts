// GLOBE LOGIC ------------------------------------------------------------------------------------------------------ //
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