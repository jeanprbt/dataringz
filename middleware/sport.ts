export default defineNuxtRouteMiddleware((to, from) => {
    const venue = useState('sport', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/sport/') && from.fullPath.includes('/sport/')) {
        venue.value = to.params.slug;
    } else {
        venue.value = undefined;
    }
});
