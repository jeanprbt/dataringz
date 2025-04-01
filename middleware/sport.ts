export default defineNuxtRouteMiddleware((to, from) => {
    const sport = useState('sport', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/sport/') && from.fullPath.includes('/sport/')) {
        sport.value = to.params.slug;
    } else {
        sport.value = undefined;
    }
});
