export default defineNuxtRouteMiddleware((to, from) => {
    const country = useState('country', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/country/') && from.fullPath.includes('/country/')) {
        country.value = to.params.slug;
    } else {
        country.value = undefined;
    }
});