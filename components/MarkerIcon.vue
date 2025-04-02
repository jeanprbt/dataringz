<template>
    <div class="flex flex-col justify-center items-center">
        <div class="
                    thumbnail 
                    flex flex-wrap justify-center 
                    w-[50px] h-auto
                    bg-zinc-50 hover:bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-800
                    rounded-lg p-[5px] shadow-md 
                    transition-opacity duration-500 ease-in
                ">
            <div 
                v-for="(sport, index) in sports"
                :key="index"
                class="imgContainer w-[30px] h-[30px] m-[2px]"
                :class="{'filter invert brightness-80': dark}"
            >
                <img class="w-full h-full" :src="sport.src" :alt="sport.alt" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
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
    }
})

const dark = ref(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
</script>