<template>
    <transition enter-from-class="opacity-0" enter-active-class="duration-500 ease-in" enter-to-class="opacity-100"
        leave-from-class="opacity-100" leave-active-class="duration-500 ease-in" leave-to-class="opacity-0">
        <div v-if="show" class="flex flex-col justify-center items-center">
            <div class="
                    thumbnail 
                    flex flex-wrap justify-center 
                    w-[35px] md:w-[50px] h-auto
                    bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-800 hover:dark:bg-zinc-700
                    border-[0.5px] border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600
                    rounded-lg p-[3px] md:p-[5px] shadow-md 
                ">
                <div v-for="(sport, index) in sports" :key="index"
                    :class="['w-[25px] md:w-[30px] h-[25px] md:h-[30px] md:m-[2px] dark:invert']">
                    <img class="w-full h-full" :src="sport.src" :alt="sport.alt" />
                </div>
            </div>
            <transition enter-from-class="opacity-0" enter-active-class="duration-300 ease-in"
                enter-to-class="opacity-100" leave-from-class="opacity-100" leave-active-class="duration-300 ease-in"
                leave-to-class="opacity-0">
                <img v-if="direction !== 0" src="/img/arrow.svg" alt="direction arrow"
                    :class="['absolute w-[10px] top-1/2 left-1/2 -translate-1/2 animate-arrow dark:invert']"
                    :style="arrowStyle" />
            </transition>
        </div>
    </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    sports: {
        type: Array,
        required: true,
        validator: (value) => {
            return Array.isArray(value) && value.every(item => {
                return typeof item === 'object' &&
                    typeof item.alt === 'string' &&
                    typeof item.src === 'string';
            });
        }
    },
    show: {
        type: Object,
        required: true
    },
    direction: {
        type: Object,
        required: false
    }
})

const direction = toRef(props, "direction");
const show = toRef(props, "show"); 

const isSmallScreen = ref(false);
onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const arrowStyle = computed(() => {
    const radius = isSmallScreen.value ? 25 : 40;
    const angleInRadians = (direction.value * Math.PI) / 180;
    const x = radius * Math.sin(angleInRadians);
    const y = -radius * Math.cos(angleInRadians) * (1 + (props.sports.length - 1) / 2);
    return {
        transform: `translate(-50%, -50%)`,
        '--dir': `${direction.value}deg`,
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--dx': `${1.1 * x}px`,
        '--dy': `${1.1 * y}px`,
    };
});
</script>