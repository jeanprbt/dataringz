<template>
    <PageModal :show="showAthletePage" :back="canGoBack" :transition="canGoBack" :items="items" @close="closePage" @back="router.back()">
        <div class="athlete-content">
            <div class="flex items-center mb-6">
                <div class="athlete-photo mr-4">
                    <AthletePicture :name="athlete.name" :slug="slug" size="lg" />
                </div>
                <div class="athlete-info">
                    <h3 class="text-xl font-medium text-zinc-800 dark:text-white">{{ athlete.name }}</h3>
                    <div v-if="athlete.age" class="text-sm text-gray-600 dark:text-gray-300 mt-1">Age: {{
                        athlete.age }}</div>
                </div>
            </div>

            <div v-if="athlete.bio" class="mb-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2 flex items-center">
                    <UIcon name="i-heroicons-user-circle" class="w-5 h-5 mr-2 text-primary" />
                    Bio
                </h3>
                <p class="text-zinc-700 dark:text-zinc-300">{{ athlete.bio }}</p>
            </div>

            <!-- Additional information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-if="athlete.birth_place" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Birth Place:</span> {{
                            athlete.birth_place }}, {{
                            athlete.birth_country }}
                    </div>
                </div>
                <div v-if="athlete.height && athlete.height > 0"
                    class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-arrow-trending-up"
                        class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Height:</span> {{ athlete.height }}
                        cm
                    </div>
                </div>
                <div v-if="athlete.weight && athlete.weight > 0"
                    class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-scale" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Weight:</span> {{ athlete.weight }}
                        kg
                    </div>
                </div>
                <div v-if="athlete.coach" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-academic-cap" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Coach:</span> {{ athlete.coach }}
                    </div>
                </div>
                <div v-if="athlete.occupation" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-briefcase" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Occupation:</span> {{
                            athlete.occupation }}
                    </div>
                </div>
                <div v-if="athlete.education" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-book-open" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Education:</span> {{
                            athlete.education }}
                    </div>
                </div>
            </div>

            <!-- Athlete accomplishments and personal information -->
            <div class="grid grid-cols-1 gap-4 mt-6">
                <div v-if="athlete.nickname" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-identification" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Nickname:</span> {{ athlete.nickname
                        }}
                    </div>
                </div>
                <div v-if="athlete.hobbies" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-heart" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Hobbies:</span> {{ athlete.hobbies
                        }}
                    </div>
                </div>
                <div v-if="athlete.family" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-users" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Family:</span> {{ athlete.family }}
                    </div>
                </div>
                <div v-if="athlete.languages" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-language" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Languages:</span> {{
                            athlete.languages }}
                    </div>
                </div>
                <div v-if="athlete.hero" class="text-sm text-zinc-700 dark:text-zinc-300 flex items-start">
                    <UIcon name="i-heroicons-star" class="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <span class="font-medium text-zinc-800 dark:text-white">Hero/Inspiration:</span> {{
                            athlete.hero }}
                    </div>
                </div>
            </div>

            <!-- Sports the athlete competes in -->
            <div class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2 flex items-center">
                    <UIcon name="i-heroicons-trophy" class="w-5 h-5 mr-2 text-primary" />
                    Sports:
                </h3>
                <div class="space-y-2">
                    <SportLink v-for="sport in athlete.sports" :key="sport.slug" :slug="sport.slug" :name="sport.name"
                        :description="sport.description" :is-inline="true" />
                </div>
            </div>

            <!-- Events the athlete participates in -->
            <div v-if="athlete.events && athlete.events.length > 0" class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2 flex items-center">
                    <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2 text-primary" />
                    Events:
                </h3>
                <ul class="list-none space-y-1 text-zinc-700 dark:text-zinc-300">
                    <li v-for="(event, index) in athlete.events" :key="index" class="flex items-start">
                        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 mr-2 mt-1 text-primary flex-shrink-0" />
                        {{ event }}
                    </li>
                </ul>
            </div>

            <!-- Medal achievements section -->
            <div v-if="athlete.achievements && athlete.achievements.length > 0" class="mt-6">
                <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2 flex items-center">
                    <UIcon name="i-heroicons-fire" class="w-5 h-5 mr-2 text-primary" />
                    Olympic Medals:
                </h3>
                <div class="space-y-2">
                    <div v-for="(medal, index) in athlete.achievements" :key="index"
                        class="p-3 rounded-lg flex items-center" :class="medalClasses(medal.type)">
                        <UIcon :name="getMedalIcon(medal.type)" class="h-8 w-8 mr-3 flex-shrink-0" />
                        <div>
                            <div class="font-medium text-zinc-800 dark:text-white">{{ medal.type }}</div>
                            <div class="text-zinc-700 dark:text-zinc-300">{{ medal.event }} ({{ medal.discipline }})
                            </div>
                            <div class="text-sm text-zinc-600 dark:text-zinc-400">{{ yearMonthDayDate(medal.date) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import { yearMonthDayDate } from '~/utils/date';
import athletes from '~/data/athletes.json';

definePageMeta({
    middleware: ['athlete', 'previous', 'breadcrumb']
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('athlete').value;
const showAthletePage = ref(!directAccess);

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const athlete = athletes[slug as keyof typeof athletes] as any;


// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showAthletePage.value = true, 4200);
    }
});

useHead(() => {
    const name = athlete.name;
    const country = athlete.country?.name || '';
    const sports = athlete.sports.map((s: { name: any; }) => s.name).join(', ');
    const medals = athlete.achievements.length > 0
        ? `${athlete.achievements.length} Olympic medals`
        : 'Olympic athlete';

    const title = `${name} - Athlete from ${country}`;
    const description = `${name} is an Olympic athlete from ${country} competing in ${sports}. ${medals}.`;

    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph / Facebook
            { property: 'og:type', content: 'profile' },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/athlete/${slug}` },
            { property: 'profile:first_name', content: name.split(' ')[0] },
            { property: 'profile:last_name', content: name.split(' ').slice(1).join(' ') },

            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

// HANDLE BACK BUTTON -----------------------------
const previous = useState('previous');
const canGoBack = computed(() => previous.value && previous.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showAthletePage.value = false;
    router.push('/');
}

// MEDAL STYLING FUNCTIONS ------------------------
const medalClasses = (medalType: string): string => {
    if (medalType.includes('Gold')) {
        return 'bg-yellow-100 dark:bg-yellow-800/30 border border-yellow-300 dark:border-yellow-600';
    } else if (medalType.includes('Silver')) {
        return 'bg-gray-100 dark:bg-zinc-600/30 border border-gray-300 dark:border-zinc-500';
    } else if (medalType.includes('Bronze')) {
        return 'bg-amber-100 dark:bg-amber-800/30 border border-amber-300 dark:border-amber-600';
    }
    return 'bg-gray-50 dark:bg-zinc-700/30 border border-gray-200 dark:border-zinc-600';
}

const getMedalIcon = (medalType: string): string => {
    if (medalType.includes('Gold')) {
        return 'i-fluent-emoji-flat-1st-place-medal';
    } else if (medalType.includes('Silver')) {
        return 'i-fluent-emoji-flat-2nd-place-medal';
    } else if (medalType.includes('Bronze')) {
        return 'i-fluent-emoji-flat-3rd-place-medal';
    }
    return 'i-heroicons-trophy';
}
</script>