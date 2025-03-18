<template>
    <NuxtLink :to="`/venue/${slug}`" class="venue-link p-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div class="venue-icon mr-2">
            <slot name="icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
            </slot>
        </div>
        <div class="venue-info">
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