import venues from '~/data/venues.json';

export default defineNuxtRouteMiddleware((to, from) => {
    const venue = useState('venue', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/venue/') && from.fullPath.includes('/venue/') && venues[to.params.slug as keyof typeof venues] !== undefined) {
        venue.value = to.params.slug;
    } else {
        venue.value = undefined;
    }
});
