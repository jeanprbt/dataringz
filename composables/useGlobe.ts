import { ref } from 'vue';

const globe = ref<mapboxgl.Map | null>(null);
export const useGlobe = () => {
    const setGlobe = (g: mapboxgl.Map) => {
        globe.value = g;
    };
    return { globe, setGlobe };
};
