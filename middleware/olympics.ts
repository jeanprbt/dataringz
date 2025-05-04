export default defineNuxtRouteMiddleware((to, from) => {
    const olympics = useState('olympics', () => false);
    if (to.fullPath.includes('/olympics') && from.fullPath.includes('olympics')) {
        olympics.value = true;
    } else {
        olympics.value = false;
    }
});