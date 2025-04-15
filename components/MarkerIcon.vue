<template>
    <div class="flex flex-col justify-center items-center">
        <div class="
                    thumbnail 
                    flex flex-wrap justify-center 
                    w-[50px] h-auto
                    bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-800
                    rounded-lg p-[5px] shadow-md 
                    transition-all duration-200 ease-in
                ">
            <div v-for="(sport, index) in sports" :key="index"
                :class="['w-[30px] h-[30px] m-[2px]', { 'filter invert brightness-80': dark }]">
                <img class="w-full h-full" :src="sport.src" :alt="sport.alt" />
            </div>
        </div>
        <transition enter-from-class="opacity-0" enter-active-class="duration-300 ease-in"
            enter-to-class="opacity-100" leave-from-class="opacity-100" leave-active-class="duration-300 ease-in"
            leave-to-class="opacity-0">
            <img v-if="direction !== 0" src="/img/arrow.svg" alt="direction arrow"
                :class="['absolute w-[10px] top-1/2 left-1/2 -translate-1/2 animate-arrow', { 'filter invert brightness-80': dark }]"
                :style="arrowStyle" />
        </transition>
    </div>
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
    direction: {
        type: Object,
        required: false
    }
})

const direction = toRef(props, "direction");
const dark = ref(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)

const arrowStyle = computed(() => {
    const radius = 40;
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