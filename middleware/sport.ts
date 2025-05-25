import sports from '~/data/sports.json';

export default defineNuxtRouteMiddleware((to, from) => {
    const sport = useState('sport', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/sport/') && from.fullPath.includes('/sport/') && sports[to.params.slug as keyof typeof sports] !== undefined) {
        sport.value = to.params.slug;
    } else {
        sport.value = undefined;
    }
});
