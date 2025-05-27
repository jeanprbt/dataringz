<template>
    <PageModal :show="showEventPage" :transition="transition" :items="items" @close="closePage">
        <div v-if="event" class="h-full">
            <div class="flex flex-col items-center justify-center h-full">
                <h3 class="font-medium text-zinc-500 dark:text-zinc-400 mb-5">
                    {{ sport.name }} | {{ event.name }}
                </h3>
                <D3Tournament v-if="event.tournament" :matches="event.matches" />
                <UTable v-else-if="event.ranking" :data="event.ranks" :columns="eventColumns" sticky />
                <p v-else
                    class="h-full flex items-center justify-center text-xs md:text-sm text-zinc-600 dark:text-gray-400">
                    Data is not yet available.
                </p>
            </div>
        </div>
        <div v-else class="h-full flex items-center justify-center">
            <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Event not found.</p>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import events from '~/data/events.json';
import sports from '~/data/sports.json';

definePageMeta({
    middleware: ['event', 'previous', 'breadcrumb'],
    layout: 'canvas'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('event').value;
const showEventPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showEventPage.value = true, 4200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const event = events[slug as keyof typeof events] as any;
const sport = event ? sports[event.sport as keyof typeof sports] as any : {} as any;

// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previousCard = useState('previous');
const transition = computed(() => previousCard.value && previousCard.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showEventPage.value = false;
    router.push('/');
}

// UI STATE
const NuxtLink = resolveComponent('NuxtLink');
const eventColumns = [
    {
        accessorKey: 'rank',
        header: '',
        cell: ({ row }: { row: any }) => {
            let rank = row.getValue('rank');
            if (rank === 1) rank = '🥇';
            else if (rank === 2) rank = '🥈';
            else if (rank === 3) rank = '🥉';
            else if (!rank) rank = '-';
            return h('div', { class: 'flex justify-center' }, [
                h('span', { class: 'font-bold' }, rank)
            ]);
        }
    },
    {
        accessorKey: 'participant_name',
        header: 'Athlete',
        cell: ({ row }: { row: any }) => {
            const athleteName = row.getValue('participant_name');
            const athleteSlug = row.original["participant_slug"];
            return athleteSlug ? h(NuxtLink, {
                class: 'flex items-center justify-left hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:px-3 rounded-lg py-1 transition-all duration-300 ease',
                to: `/athlete/${athleteSlug}`
            }, () => athleteName) : athleteName;
        }
    },
    {
        accessorKey: 'participant_country',
        header: 'Country',
        cell: ({ row }: { row: any }) => {
            const countryCode = row.original["country_code"];
            const countryName = row.getValue('participant_country');
            return h('div', { class: 'flex items-center' }, [
                countryCode ? h('img', {
                    src: `/img/countries/${countryCode.toLowerCase()}.svg`,
                    alt: countryName,
                    class: 'w-5 h-5 mr-2 rounded-full object-cover'
                }) : null,
                countryName
            ]);
        }
    },
    {
        accessorKey: 'result',
        header: 'Result',
        cell: ({ row }: { row: any }) => {
            const resultType = row.original["result_type"];
            let result = row.getValue('result');
            if (!result) result = '-';
            if (resultType === "TIME") return formatTime(result);
            else if (resultType === "DISTANCE") return formatDistance(result);
            else if (resultType === "POINTS") return `${result} pts`
            return result;
        }
    }
];
</script>