import { ref } from 'vue';

const canvas = ref<mapboxgl.Map | null>(null);
export const useCanvas = () => {
    const setCanvas = (m: mapboxgl.Map) => {
        canvas.value = m;
    };
    return { canvas, setCanvas };
};
