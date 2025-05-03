import { ref } from 'vue';

const section = ref<string>('map');
export const useSection = () => {
    const setSection = (s: string) => {
        section.value = s;
    };
    return { section, setSection };
};
