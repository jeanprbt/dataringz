import type { BreadcrumbItem } from "@nuxt/ui";

const getBreadcrumbItems = (
    breadcrumb: Array<{ slug: string, to: string }>,
    venues: { [key: string]: any },
    sports: { [key: string]: any },
    athletes: { [key: string]: any }
): BreadcrumbItem[] => {
    return breadcrumb.map(item => {
        let label = "";
        let icon = "";
        if (item.to.includes('/venue/')) {
            label = venues[item.slug].name;
            icon = 'i-lucide-compass';
        } else if (item.to.includes('/athlete/')) {
            label = athletes[item.slug].name;
            icon = 'i-lucide-person-standing';
        } else if (item.to.includes('/sport/')) {
            label = sports[item.slug].name;
            icon = 'i-lucide-dumbbell';
        }
        return {
            label: label,
            icon: icon,
            to: item.to
        }
    })
}

export { getBreadcrumbItems };