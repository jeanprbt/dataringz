<template>
    <div v-if="show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" @click="close">
        <div class="bg-white/80 dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[90%] h-[90%] overflow-auto" @click.stop>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ title }}</h2>
                <button @click="close" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps({
    show: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['close']);

const router = useRouter();

function close() {
    emit('close');
    // Use a small timeout to allow for transition effects
    setTimeout(() => {
        router.push('/');
    }, 200);
}
</script> 