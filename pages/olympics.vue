<template>
    <PageModal :show="showOlympicsPage" :transition="false" @close="closePage">
        <h1 class="text-2xl font-bold mb-4">Olympics</h1>
        <div class="w-full h-[65vh]">
            <div class="text-lg mb-4">Sample tournament</div>
            <d3-tournament :matches="sampleMatches" class="h-[calc(100%-2rem)]" />
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