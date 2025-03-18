<template>
    <NuxtLink :to="`/country/${slug}`" class="country-link p-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div class="country-flag mr-2">
            <slot name="flag">
                <div class="w-6 h-4 bg-gray-200 rounded overflow-hidden">
                    <img v-if="code" :src="`/img/flags/${code.toLowerCase()}.svg`" :alt="`Flag of ${name}`" class="w-full h-full object-cover" />
                </div>
            </slot>
        </div>
        <div class="country-info">
            <div class="font-medium">{{ name }}</div>
            <div v-if="details" class="text-sm text-gray-500 dark:text-gray-400">{{ details }}</div>
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
    code: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    }
});
</script> 