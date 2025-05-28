import type { BreadcrumbItem } from '@nuxt/ui';

import venues from '~/data/venues.json';
import sports from '~/data/sports.json';
import athletes from '~/data/athletes.json';
import events from '~/data/events.json';
import countries from '~/data/countries.json';

export default defineNuxtRouteMiddleware((to, _) => {
    const breadcrumb = useState('breadcrumb', () => [] as BreadcrumbItem[]);
    const slug = to.params.slug as string;
    if (to.fullPath.includes('/venue/')) {
        const venue = venues[slug as keyof typeof venues];
        if (venue === undefined) return;
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
        if (sport === undefined) return;
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
        if (athlete === undefined) return;
        const slugIndex = breadcrumb.value.findIndex(item => item.label === athlete.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: athlete.name,
                to: `/athlete/${slug}`,
                icon: 'i-lucide-person-standing',
            })
        }
    } else if (to.fullPath.includes('/event/')) {
        const event = events[slug as keyof typeof events] as any;
        if (event === undefined) return;
        const slugIndex = breadcrumb.value.findIndex(item => item.label === event.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: event.name,
                to: `/event/${slug}`,
                icon: 'i-lucide-medal',
            })
        }
    } else if (to.fullPath.includes('/country/')) {
        const country = countries[slug as keyof typeof countries] as any;
        if (country === undefined) return;
        const slugIndex = breadcrumb.value.findIndex(item => item.label === country.name)
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: country.name,
                to: `/country/${slug}`,
                icon: 'i-lucide-globe',
            })
        }
    } else if (to.fullPath.includes('/olympics')) {
        const slugIndex = breadcrumb.value.findIndex(item => item.label === "Overview");
        if (slugIndex !== -1) {
            breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
        } else {
            breadcrumb.value.push({
                label: 'Overview',
                to: '/olympics',
                avatar: {
                    src: '/img/paris_olympics.svg',
                    size: 'lg',
                    class: 'bg-transparent rounded-sm pr-1 dark:invert'
                }
            })
        }
    } else {
        breadcrumb.value = [];
    }
});