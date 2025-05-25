import athletes from '~/data/athletes.json';

export default defineNuxtRouteMiddleware((to, from) => {
    const athlete = useState('athlete', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/athlete/') && from.fullPath.includes('/athlete/') && athletes[to.params.slug as keyof typeof athletes] !== undefined) {
        athlete.value = to.params.slug;
    } else {
        athlete.value = undefined;
    }
});