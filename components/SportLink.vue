<template>
    <NuxtLink :to="`/sport/${slug}`"
        class="sport-link p-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div class="sport-icon mr-2">
            <slot name="icon">
                <SportPicture :name="name" :slug="slug" size="sm" />
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