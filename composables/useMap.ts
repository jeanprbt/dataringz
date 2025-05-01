import { ref } from 'vue';

const map = ref<mapboxgl.Map | null>(null);
export const useMap = () => {
    const setMap = (m: mapboxgl.Map) => {
        map.value = m;
    };
    return { map, setMap };
};
