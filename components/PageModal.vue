<template>
    <div v-if="show" class="fixed h-full w-full flex items-center justify-center z-1 animate-modal-background"
        @click="close">
        <div class="relative rounded-lg p-6 w-[80%] h-[80%] overflow-auto animate-modal-shape-light dark:animate-modal-shape-dark"
            @click.stop>
            <div class="flex justify-end items-center mb-4 animate-modal-content">
                <button @click="close"
                    class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="opacity-0 animate-modal-content">
                <slot></slot>
            </div>
            <svg class="absolute top-0 left-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="none" stroke-width="8" stroke-dasharray="400%" rx="8" ry="8"
                    stroke-dashoffset="400%" class="stroke-white dark:stroke-zinc-700 animate-modal-rectangle" />


            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps({
    show: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close']);
const router = useRouter();

const close = () => {
    emit('close');
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script>