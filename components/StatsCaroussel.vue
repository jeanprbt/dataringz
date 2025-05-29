<template>
    <div class="h-full flex flex-col justify-center items-center relative min-h-0 w-full">
        <div class="w-full flex-1 relative min-h-0">
            <div v-for="(stat, index) in stats" :key="stat.id" :class="[
                'absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center px-2',
                'transition-all duration-500',
                currentIndex === index
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 pointer-events-none',
                index > currentIndex ? 'transform translate-y-4' : 'transform -translate-y-4'
            ]">
                <div :class="{
                    'font-bold text-zinc-800 dark:text-white mb-1': true,
                    'text-6xl lg:text-7xl': stat.id === 'athletes',
                    'text-7xl lg:text-8xl': stat.id !== 'athletes'
                }">
                    {{ stat.value }}
                </div>
                <div class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {{ stat.label }}
                </div>
            </div>
        </div>

        <div class="flex justify-center space-x-1 mt-auto mb-2">
            <div v-for="(_, index) in stats" :key="`dot-${index}`" :class="[
                'h-1.5 rounded-full transition-all duration-300',
                currentIndex === index
                    ? 'bg-primary w-4'
                    : 'bg-gray-300 dark:bg-gray-600 w-1.5'
            ]">
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const stats = [
    { id: 'athletes', value: '10,714', label: 'Athletes' },
    { id: 'wr', value: '12', label: 'World Records' },
    { id: 'or', value: '27', label: 'Olympic Records' },
    { id: 'tickets', value: '12M', label: 'Tickets Sold' },
    { id: 'venues', value: '39', label: 'Venues' }
];

const currentIndex = ref(0);
let intervalId = null;

const goToNext = () => {
    currentIndex.value = (currentIndex.value + 1) % stats.length;
};

onMounted(() => {
    intervalId = setInterval(goToNext, 2500);
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
</script>
