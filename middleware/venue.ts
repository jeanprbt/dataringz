export default defineNuxtRouteMiddleware((to, from) => {
    const venue = useState('venue', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/venue/') && from.fullPath.includes('/venue/')) {
        venue.value = to.params.slug;
    } else {
        venue.value = undefined;
    }
});
