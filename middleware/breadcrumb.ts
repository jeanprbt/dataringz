export default defineNuxtRouteMiddleware((to, _) => {
    const breadcrumb = useState('breadcrumb', () => [] as Array<{ slug: string, to: string }>);

    const slugIndex = breadcrumb.value.findIndex(item => item.slug === to.params.slug);
    if (slugIndex !== -1) {
        breadcrumb.value = breadcrumb.value.slice(0, slugIndex + 1);
    } else if (to.fullPath.includes('/athlete/')) {
        breadcrumb.value.push({
            slug: to.params.slug as string,
            to: `/athlete/${to.params.slug}`
        });
    } else if (to.fullPath.includes('/sport/')) {
        breadcrumb.value.push({
            slug: to.params.slug as string,
            to: `/sport/${to.params.slug}`
        });
    } else if (to.fullPath.includes('/venue/')) {
        breadcrumb.value.push({
            slug: to.params.slug as string,
            to: `/venue/${to.params.slug}`
        });
    } else {
        breadcrumb.value = [];
    }

});