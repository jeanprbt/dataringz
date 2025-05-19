<template>
    <div class="max-w-4xl mx-auto py-8 px-4">
        <!-- Table with fixed header -->
        <div class="relative border rounded-lg shadow-lg overflow-hidden">
            <!-- Fixed header -->
            <div class="sticky top-0 z-20 bg-blue-500 text-white">
                <div class="flex w-full">
                    <div class="py-3 px-4 text-left whitespace-nowrap w-16">Rank</div>
                    <div class="py-3 px-4 text-left whitespace-nowrap flex-1 min-w-[200px]">Country</div>
                    <div class="py-3 px-4 text-center whitespace-nowrap w-16">
                        <span class="flex justify-center items-center">
                            <span class="text-xl">🥇</span>
                        </span>
                    </div>
                    <div class="py-3 px-4 text-center whitespace-nowrap w-16">
                        <span class="flex justify-center items-center">
                            <span class="text-xl">🥈</span>
                        </span>
                    </div>
                    <div class="py-3 px-4 text-center whitespace-nowrap w-16">
                        <span class="flex justify-center items-center">
                            <span class="text-xl">🥉</span>
                        </span>
                    </div>
                    <div class="py-3 px-4 text-center whitespace-nowrap font-bold w-24">Total</div>
                </div>
            </div>

            <!-- Scrollable body -->
            <div class="overflow-y-auto overflow-x-auto max-h-[60vh] scroll-smooth touch-pan-x">
                <div v-for="(country, index) in sortedMedals" :key="country.country_code" :class="[
                    getMedalBackgroundClass(index),
                    'hover:bg-opacity-90 transition-colors duration-150 flex w-full'
                ]">
                    <div class="py-3 px-4 font-semibold whitespace-nowrap w-16">
                        <div class="flex items-center">
                            {{ country.displayRank }}
                        </div>
                    </div>
                    <div class="py-3 px-4 whitespace-nowrap flex-1 min-w-[200px]">
                        <div class="flex items-center">
                            <img :src="getFlagUrl(country.flag)" :alt="`Flag of ${country.country}`"
                                class="w-8 h-6 object-cover rounded shadow-sm mr-3" />
                            <span class="font-medium">{{ country.country_long }}</span>
                        </div>
                    </div>
                    <div class="py-3 px-4 text-center font-semibold w-16">{{ country.gold }}</div>
                    <div class="py-3 px-4 text-center font-semibold w-16">{{ country.silver }}</div>
                    <div class="py-3 px-4 text-center font-semibold w-16">{{ country.bronze }}</div>
                    <div class="py-3 px-4 text-center font-bold whitespace-nowrap w-24">
                        <span :class="[
                            index < 3 ? 'bg-opacity-25 text-gray-900' : 'bg-blue-100 text-blue-800',
                            'py-1 px-3 rounded-full inline-block',
                            index === 0 ? 'bg-yellow-300' : '',
                            index === 1 ? 'bg-gray-300' : '',
                            index === 2 ? 'bg-amber-600' : ''
                        ]">
                            {{ country.Total }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Swipe indicator for mobile -->
        <div class="mt-2 text-center text-gray-500 md:hidden">
            <p class="text-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Swipe to see more
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Define props for medal data
const props = defineProps({
    medalData: {
        type: Array,
        required: true,
        default: () => []
    }
})

const sortedMedals = computed(() => {
    // First sort alphabetically to handle potential ties
    const alphabeticallySorted = [...props.medalData].sort((a, b) =>
        a.country.localeCompare(b.country)
    )

    // Then sort by medal count (gold first, then silver, then bronze)
    const sorted = alphabeticallySorted.sort((a, b) => {
        if (a.gold !== b.gold) return b.gold - a.gold
        if (a.silver !== b.silver) return b.silver - a.silver
        if (a.bronze !== b.bronze) return b.bronze - a.bronze
        return 0
    })

    // Add display rank with proper handling of ex-aequos
    let currentRank = 1
    let previousCountry = null

    return sorted.map((country, index) => {
        const isExAequo = previousCountry &&
            previousCountry.gold === country.gold &&
            previousCountry.silver === country.silver &&
            previousCountry.bronze === country.bronze

        if (!isExAequo && index > 0) {
            currentRank = index + 1
        }

        previousCountry = country

        return {
            ...country,
            displayRank: isExAequo ? '-' : currentRank
        }
    })
})

// Helper function to get the correct flag URL
function getFlagUrl(flagPath) {
    // If the flagPath is a full URL, return it
    if (flagPath && flagPath.startsWith('http')) {
        return flagPath
    }
    return flagPath
}

// Helper function to get background class based on medal position
function getMedalBackgroundClass(index) {
    if (index === 0) {
        return 'bg-yellow-100 bg-opacity-80'  // Gold
    } else if (index === 1) {
        return 'bg-gray-200 bg-opacity-80'    // Silver
    } else if (index === 2) {
        return 'bg-amber-100 bg-opacity-60'   // Bronze
    } else {
        return index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
    }
}
</script>
