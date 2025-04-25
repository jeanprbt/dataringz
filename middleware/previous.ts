export default defineNuxtRouteMiddleware((to, from) => {
    const previous = useState('previous', () => undefined as undefined | string);
    if (from.fullPath) {
        previous.value = from.fullPath;
    }
});