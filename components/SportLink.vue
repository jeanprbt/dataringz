<template>
    <NuxtLink :to="`/sport/${slug}`" class="sport-link p-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div class="sport-icon mr-2">
            <slot name="icon">
                <div class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                </div>
            </slot>
        </div>
        <div class="sport-info">
            <div class="font-medium">{{ name }}</div>
            <div v-if="description" class="text-sm text-gray-500 dark:text-gray-400">{{ description }}</div>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps({
    slug: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});
</script> 