<template>
    <PageModal :show="showOlympicsPage" :transition="false" :olympics="true" @close="closePage">
        <div :class="['gap-4 p-2 h-full', { 'grid grid-cols-12': selected === 0 }]">
            <UCard variant="soft" :ui="{ 'body': 'p-4 md:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-3': selected === 0,
                'transition-all duration-300': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 1,
                'transition-all duration-500 transform h-full': selected === 1,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <!-- bento -->
                    <div class="flex flex-col justify-center items-center h-full text-center space-y-6">
                        <div
                            class="text-6xl md:text-7xl font-extrabold text-primary dark:text-white leading-none drop-shadow-sm">
                            XXXIII
                        </div>
                        <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">
                            Olympics of the Modern Era
                        </p>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 2 ? () => { } : toggleCard(2)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-6': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 2,
                    'transition-all duration-500 transform h-full overflow-auto': selected === 2,
                    'hidden': selected !== 0 && selected !== 2
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 2" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 z-50"
                            @click.stop="toggleCard(2)" />
                        <UTable sticky :data="medals_total" :columns="medalsColumns" class="w-11/12" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Medals ranking</h2>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain mx-auto pb-10" src="/img/podium.png" />
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                'col-span-12 md:col-span-3': selected === 0,
                'transition-all duration-300': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previous === 3,
                'transition-all duration-500 transform h-full': selected === 3,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <!-- bento -->
                    <div class="h-full relative">
                        <StatsCaroussel />
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 4 ? () => { } : toggleCard(4)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-6': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 4,
                    'transition-all duration-500 transform h-full': selected === 4,
                    'hidden': selected !== 0 && selected !== 4
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 4" class="w-full h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(4)" />
                        <D3EventsSunburst />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Events repartition</h2>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain" src="/img/foo_sunburst.png" />
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 5 ? () => { } : toggleCard(5)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-6': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 5,
                    'transition-all duration-500 transform h-full': selected === 5,
                    'hidden': selected !== 0 && selected !== 5
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 5" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(5)" />
                        <D3MedalsRace :medal-data="medals" />
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Medals race</h2>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain mx-auto pb-10" src="/img/medals-race.png" alt="Podium" />
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'canvas'
})

import medals from '~/data/medals.json';
import medals_total from '~/data/medals_total.json';

// HANDLE DIRECT URL ---------------
let directAccess = useState('olympics').value;
const showOlympicsPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showOlympicsPage.value = true, 4200);
    }
});

// HANDLE CLOSE BUTTON -------------
const router = useRouter();
const closePage = () => {
    showOlympicsPage.value = false;
    router.push('/');
}

// UI STATE ------------------------
const selected = ref(0);
const previous = ref(0);
const transitioning = ref(false);
const toggleCard = (index: number = 0) => {
    if (selected.value !== 0) {
        previous.value = selected.value;
        transitioning.value = true;
        selected.value = 0;
        setTimeout(() => {
            transitioning.value = false;
        }, 500);
    }
    else selected.value = index;
}

const medalsColumns = [
    {
        accessorKey: 'rank',
        header: '',
        cell: ({ row, table }: { row: any, table: any }) => {
            const rank = row.getValue('rank');
            const rowIndex = row.index;
            const rows = table.getRowModel().rows;
            const hasSameRankAsPrevious = rowIndex > 0 &&
                rows[rowIndex - 1].getValue('rank') === rank;

            let displayRank = rank;
            if (hasSameRankAsPrevious) {
                displayRank = '-';
            }

            return h('div', { class: 'flex justify-center' }, [
                h('span', { class: 'font-bold' }, displayRank)
            ]);
        }
    },
    {
        accessorKey: 'country',
        header: 'Country',
        cell: ({ row }: { row: any }) => {
            const flag = row.original["flag"];
            const countryName = row.getValue('country');
            return h('div', { class: 'flex items-center' }, [
                h('img', {
                    src: flag,
                    alt: countryName,
                    class: 'w-5 h-5 mr-2 rounded-full object-cover'
                }),
                countryName
            ]);
        }
    },
    {
        accessorKey: 'bronze',
        header: '🥉',
    },
    {
        accessorKey: 'silver',
        header: '🥈'
    },
    {
        accessorKey: 'gold',
        header: '🥇'
    },
    {
        accessorKey: 'total',
        header: 'Total',
        meta: {
            class: {
                td: 'w-6',
                th: 'text-center'
            }
        },
        cell: ({ row }: { row: any }) => {
            const total = row.getValue('total');
            const rank = row.getValue('rank');

            let bgColorClass = 'bg-zinc-200/50 dark:bg-zinc-900';
            if (rank === 1) {
                bgColorClass = 'bg-amber-300/50';
            } else if (rank === 2) {
                bgColorClass = 'bg-slate-300/50';
            } else if (rank === 3) {
                bgColorClass = 'bg-amber-700/30';
            }

            return h('div', { class: `${bgColorClass} rounded-lg px-4 py-2 flex justify-center font-bold` }, [
                total
            ]);
        }
    }
]
</script>