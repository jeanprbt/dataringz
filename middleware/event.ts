import sports from '~/data/sports.json';

export default defineNuxtRouteMiddleware((to, from) => {
    const event = useState('event', () => undefined as undefined | string | string[]);
    if (to.fullPath.includes('/event/') && from.fullPath.includes('/event/')) {
        const slug = to.params.slug as string;
        let sport: any;
        let evt: any;
        for (const key of Object.keys(sports)) {
            if (slug.startsWith(key + '-')) {
                sport = sports[key as keyof typeof sports];
                evt = sport.events[slug as keyof typeof sport.events];
            }
        }
        if (sport === undefined || evt === undefined) event.value = undefined;
        else event.value = to.params.slug;
    } else {
        event.value = undefined;
    }
});
