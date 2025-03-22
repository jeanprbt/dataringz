<template>
    <NuxtLink :to="`/country/${slug}`" 
        :class="[
            isInline 
                ? 'py-1 px-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors'
                : 'flex flex-col items-center p-3 bg-white dark:bg-zinc-700 rounded-lg shadow border border-zinc-200 dark:border-zinc-600 hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-zinc-600 transition-all duration-200 ease-in-out'
        ]">
        <div :class="{ 'mr-2': isInline, 'mb-2': !isInline }">
            <slot name="flag">
                <div :class="{ 'w-6 h-4': isInline, 'w-10 h-6': !isInline }" class="rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img v-if="code" :src="`/img/flags/${code.toLowerCase()}.svg`" :alt="`Flag of ${name}`" class="w-full h-full object-cover" />
                </div>
            </slot>
        </div>
        <div v-if="isInline">
            <div class="font-medium text-zinc-800 dark:text-white">{{ name }}</div>
            <div v-if="details" class="text-sm text-zinc-500 dark:text-gray-400">{{ details }}</div>
        </div>
        <template v-else>
            <span class="text-center text-sm font-medium text-zinc-800 dark:text-white">{{ name }}</span>
            <span v-if="details" class="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">{{ details }}</span>
            <slot name="after"></slot>
        </template>
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
    },
    isInline: {
        type: Boolean,
        default: false
    }
});
</script> 