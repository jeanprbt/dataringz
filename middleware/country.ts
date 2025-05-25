import countries from '~/data/countries.json';

export default defineNuxtRouteMiddleware((to, from) => {
    const { setSection } = useSection();
    const country = useState('country', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/country/') && from.fullPath.includes('/country/') && countries[to.params.slug as keyof typeof countries] !== undefined) {
        setSection('globe');
        country.value = to.params.slug;
    } else {
        country.value = undefined;
    }
});