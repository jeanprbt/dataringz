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
                        <div
                            class="text-xl md:text-2xl font-medium text-muted-foreground dark:text-zinc-300 max-w-xs md:max-w-sm">
                            Olympics of the Modern Era
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 2 ? () => { } : toggleCard(2)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-6': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 2,
                    'transition-all duration-500 transform h-full': selected === 2,
                    'hidden': selected !== 0 && selected !== 2
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 2" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(2)" />
                        <MedalsRanking :medal-data="medals_total"/>
                    </div>
                    <!-- bento -->
                    <div v-else class="h-full relative">
                        <h3 class="font-medium">Medals Ranking</h3>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain mx-auto pb-10" src="/img/podium.png"/>
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
                        <h3 class="font-medium text-zinc-800 dark:text-white">Events Repartition</h3>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain" src="/img/foo_sunburst.png"/>
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
                        <h3 class="font-medium">Medals Race</h3>
                        <div class="flex h-full items-center justify-center">
                            <img class="w-1/3 object-contain mx-auto pb-10" src="/img/medals-race.png"
                                alt="Podium" />
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['olympics'],
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
</script>