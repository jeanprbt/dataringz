import type { BreadcrumbItem } from '@nuxt/ui';

import venues from '~/data/venues.json';
import sports from '~/data/sports.json';
import athletes from '~/data/athletes.json';

export default defineNuxtRouteMiddleware((to, _) => {
    const breadcrumb = useState('breadcrumb', () => [] as BreadcrumbItem[]);
    const slug = to.params.slug;
    if (to.fullPath.includes('/venue/')) {
        const venue = venues[slug as keyof typeof venues];
        const slugIndex = breadcrumb.value.findIndex(item => item.label === venue.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: venue.name,
                to: `/venue/${slug}`,
                icon: 'i-lucide-compass'
            })
        }
    } else if (to.fullPath.includes('/sport/')) {
        const sport = sports[slug as keyof typeof sports];
        const slugIndex = breadcrumb.value.findIndex(item => item.label === sport.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: sport.name,
                to: `/sport/${slug}`,
                icon: 'i-lucide-dumbbell'
            })
        }
    } else if (to.fullPath.includes('/athlete/')) {
        const athlete = athletes[slug as keyof typeof athletes] as any;
        const slugIndex = breadcrumb.value.findIndex(item => item.label === athlete.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: athlete.name,
                to: `/athlete/${slug}`,
                icon: 'i-lucide-person-standing'
            })
        }
    } else {
        breadcrumb.value = [];
    }
});