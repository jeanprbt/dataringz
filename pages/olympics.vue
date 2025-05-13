<template>
    <PageModal :show="showOlympicsPage" :transition="false" :olympics="true" @close="closePage">
        <div :class="['gap-4 p-2 h-full', { 'grid grid-cols-12': selected === 0 }]">
            <UCard variant="soft" @click="selected === 1 ? () => { } : toggleCard(1)"
                :ui="{ 'body': 'p-4 md:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-6': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 1,
                    'transition-all duration-500 transform h-full': selected === 1,
                    'hidden': selected !== 0 && selected !== 1
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 1" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(1)" />
                        <h2 class="text-xl font-bold mb-2">Tournament Brackets</h2>
                        <p>Interactive tournament visualization</p>
                        <d3-tournament :matches="sampleMatches" />
                    </div>
                    <!-- bento -->
                    <div v-else>
                        <h3 class="font-medium">Tournaments</h3>
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
                        <h2 class="text-xl font-bold mb-2">Athletes Performance</h2>
                        <p>Individual athlete statistics and records</p>
                    </div>
                    <!-- bento -->
                    <div v-else>
                        <h3 class="font-medium">Athletes</h3>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 3 ? () => { } : toggleCard(3)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-4': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 3,
                    'transition-all duration-500 transform h-full': selected === 3,
                    'hidden': selected !== 0 && selected !== 3
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 3" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <h2 class="text-xl font-bold mb-2">Gender Distribution by Trial</h2>
                        <p>Detailed statistics about gender distribution by trial</p>
                        <D3GenderPieChart sport-slug="athletics" />
                    </div>
                    <!-- bento -->
                    <div v-else>
                        <h3 class="font-medium">Gender Distribution</h3>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 4 ? () => { } : toggleCard(4)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-4': selected === 0,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previous === 4,
                    'transition-all duration-500 transform h-full': selected === 4,
                    'hidden': selected !== 0 && selected !== 4
                }">
                <template #default>
                    <!-- full screen -->
                    <div v-if="selected === 4" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(4)" />
                        <h2 class="text-xl font-bold mb-2">Event Schedule</h2>
                        <p>Complete schedule of Olympic events</p>
                    </div>
                    <!-- bento -->
                    <div v-else>
                        <h3 class="font-medium">Schedule</h3>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" @click="selected === 5 ? () => { } : toggleCard(5)"
                :ui="{ 'body': 'p-4 sm:p-6 h-full' }" :class="{
                    'col-span-12 md:col-span-4': selected === 0,
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
                        <h2 class="text-xl font-bold mb-2">Historical Data</h2>
                        <p>Historical Olympic results and records</p>
                    </div>
                    <!-- bento -->
                    <div v-else>
                        <h3 class="font-medium">History</h3>
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

// SAMPLE MATCHES ------------------ (DELETE)
const sampleMatches = ref([
    // First Round (Round of 16)
    {
        id: 'r0m0',
        round: 0,
        match: 0,
        team1: 'France',
        team2: 'Croatia',
        team1Code: 'FR',
        team2Code: 'HR',
        winner: 'France',
        score1: 3,
        score2: 1
    },
    {
        id: 'r0m1',
        round: 0,
        match: 1,
        team1: 'Brazil',
        team2: 'Mexico',
        team1Code: 'BR',
        team2Code: 'MX',
        winner: 'Brazil',
        score1: 2,
        score2: 0
    },
    {
        id: 'r0m2',
        round: 0,
        match: 2,
        team1: 'England',
        team2: 'Colombia',
        team1Code: 'GB',
        team2Code: 'CO',
        winner: 'England',
        score1: 2,
        score2: 1
    },
    {
        id: 'r0m3',
        round: 0,
        match: 3,
        team1: 'Belgium',
        team2: 'Japan',
        team1Code: 'BE',
        team2Code: 'JP',
        winner: 'Belgium',
        score1: 3,
        score2: 2
    },
    {
        id: 'r0m4',
        round: 0,
        match: 4,
        team1: 'Spain',
        team2: 'Russia',
        team1Code: 'ES',
        team2Code: 'RU',
        winner: 'Spain',
        score1: 2,
        score2: 0
    },
    {
        id: 'r0m5',
        round: 0,
        match: 5,
        team1: 'Denmark',
        team2: 'Australia',
        team1Code: 'DK',
        team2Code: 'AU',
        winner: 'Denmark',
        score1: 1,
        score2: 0
    },
    {
        id: 'r0m6',
        round: 0,
        match: 6,
        team1: 'Germany',
        team2: 'Sweden',
        team1Code: 'DE',
        team2Code: 'SE',
        winner: 'Germany',
        score1: 2,
        score2: 1
    },
    {
        id: 'r0m7',
        round: 0,
        match: 7,
        team1: 'Argentina',
        team2: 'Portugal',
        team1Code: 'AR',
        team2Code: 'PT',
        winner: 'Portugal',
        score1: 1,
        score2: 2
    },
    // Second Round (Quarter-finals)
    {
        id: 'r1m0',
        round: 1,
        match: 0,
        team1: 'France',
        team2: 'Brazil',
        team1Code: 'FR',
        team2Code: 'BR',
        winner: 'France',
        score1: 2,
        score2: 1
    },
    {
        id: 'r1m1',
        round: 1,
        match: 1,
        team1: 'England',
        team2: 'Belgium',
        team1Code: 'GB',
        team2Code: 'BE',
        winner: 'Belgium',
        score1: 0,
        score2: 2
    },
    {
        id: 'r1m2',
        round: 1,
        match: 2,
        team1: 'Spain',
        team2: 'Denmark',
        team1Code: 'ES',
        team2Code: 'DK',
        winner: 'Spain',
        score1: 3,
        score2: 2
    },
    {
        id: 'r1m3',
        round: 1,
        match: 3,
        team1: 'Germany',
        team2: 'Portugal',
        team1Code: 'DE',
        team2Code: 'PT',
        winner: 'Germany',
        score1: 1,
        score2: 0
    },
    // Third Round (Semi-finals)
    {
        id: 'r2m0',
        round: 2,
        match: 0,
        team1: 'France',
        team2: 'Belgium',
        team1Code: 'FR',
        team2Code: 'BE',
        winner: 'France',
        score1: 1,
        score2: 0
    },
    {
        id: 'r2m1',
        round: 2,
        match: 1,
        team1: 'Spain',
        team2: 'Germany',
        team1Code: 'ES',
        team2Code: 'DE',
        winner: 'Spain',
        score1: 2,
        score2: 1
    },
    // Fourth Round (Final)
    {
        id: 'r3m0',
        round: 3,
        match: 0,
        team1: 'France',
        team2: 'Spain',
        team1Code: 'FR',
        team2Code: 'ES',
        winner: 'France',
        score1: 4,
        score2: 2
    }
]);
</script>