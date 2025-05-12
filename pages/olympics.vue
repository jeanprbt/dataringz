<template>
    <PageModal :show="showOlympicsPage" :transition="true" :olympics="true" @close="closePage">
        <div class="grid grid-cols-12 gap-4 p-2 h-full">
            <UCard
                :class="selectedCard === 0 ? ['col-span-12 md:col-span-6', animationCardClass] : selectedCard === 1 ? 'col-span-12' : 'hidden'"
                variant="soft" @click="toggleCard(1)">
                <template #default>
                    <div v-if="selectedCard === 1" class="h-[calc(100vh-18rem)]">
                        <h2 class="text-xl font-bold mb-2">Tournament Brackets</h2>
                        <!-- Custom content for card 3 -->
                        <p>Interactive tournament visualization</p>
                        <d3-tournament :matches="sampleMatches" />
                    </div>
                    <div v-else>
                        <h3 class="font-medium">Tournaments</h3>
                    </div>
                </template>
            </UCard>

            <UCard
                :class="selectedCard === 0 ? ['col-span-12 md:col-span-6', animationCardClass] : selectedCard === 2 ? 'col-span-12' : 'hidden'"
                variant="soft" @click="toggleCard(2)">
                <template #default>
                    <div v-if="selectedCard === 2">
                        <h2 class="text-xl font-bold mb-2">Athletes Performance</h2>
                        <!-- Custom content for card 2 -->
                        <p>Individual athlete statistics and records</p>
                    </div>
                    <div v-else>
                        <h3 class="font-medium">Athletes</h3>
                    </div>
                </template>
            </UCard>

            <UCard
                :class="selectedCard === 0 ? ['col-span-12 md:col-span-4', animationCardClass] : selectedCard === 3 ? 'col-span-12' : 'hidden'"
                variant="soft" @click="toggleCard(3)">
                <template #default>
                    <div v-if="selectedCard === 3">
                        <h2 class="text-xl font-bold mb-2">Gender Distribution by Trial</h2>
                        <!-- Custom content for card 1 -->
                        <p>Detailed statistics about gender distribution by trial</p>
                        <D3GenderPieChart sport-slug="athletics" />
                    </div>
                    <div v-else>
                        <h3 class="font-medium">Gender Distribution</h3>
                    </div>
                </template>
            </UCard>

            <UCard
                :class="selectedCard === 0 ? ['col-span-12 md:col-span-4', animationCardClass] : selectedCard === 4 ? 'col-span-12' : 'hidden'"
                variant="soft" @click="toggleCard(4)">
                <template #default>
                    <div v-if="selectedCard === 4">
                        <h2 class="text-xl font-bold mb-2">Event Schedule</h2>
                        <!-- Custom content for card 4 -->
                        <p>Complete schedule of Olympic events</p>
                    </div>
                    <div v-else>
                        <h3 class="font-medium">Schedule</h3>
                    </div>
                </template>
            </UCard>

            <UCard
                :class="selectedCard === 0 ? ['col-span-12 md:col-span-4', animationCardClass] : selectedCard === 5 ? 'col-span-12' : 'hidden'"
                variant="soft" @click="toggleCard(5)">
                <template #default>
                    <div v-if="selectedCard === 5">
                        <h2 class="text-xl font-bold mb-2">Historical Data</h2>
                        <!-- Custom content for card 5 -->
                        <p>Historical Olympic results and records</p>
                    </div>
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
    // middleware: ['olympics'],
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
const selectedCard = ref(0);
const toggleCard = (index: number = 0) => {
    if (selectedCard.value !== 0) selectedCard.value = 0;
    else selectedCard.value = index;
}
const animationCardClass = "transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50";


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