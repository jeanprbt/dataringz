<template>
    <div class="h-full flex flex-col justify-center items-center relative">
        <div class="w-full h-full relative">
            <div v-for="(stat, index) in stats" :key="stat.id" :class="[
                'absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center',
                'transition-all duration-500',
                currentIndex === index
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 pointer-events-none',
                index > currentIndex ? 'transform translate-y-4' : 'transform -translate-y-4'
            ]">
                <div :class="[
                    'font-extrabold leading-none drop-shadow-sm mb-2',
                    stat.id === 'athletes' ? 'text-6xl md:text-7xl' : 'text-7xl md:text-8xl',
                    stat.id === 'wr' ? 'text-amber-500 dark:text-amber-400' :
                        stat.id === 'or' ? 'text-blue-600 dark:text-blue-500' :
                            'text-primary dark:text-white'
                ]">{{ stat.value }}</div>
                <div
                    class="text-xl md:text-xl font-medium text-muted-foreground dark:text-zinc-300 max-w-xs md:max-w-sm">
                    {{ stat.label }}
                </div>
            </div>
        </div>

        <div class="flex justify-center space-x-1 absolute bottom-4">
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
