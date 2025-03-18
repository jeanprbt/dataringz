<template>
    <NuxtLink :to="`/athlete/${slug}`" class="athlete-link p-2 flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div class="athlete-photo mr-2">
            <slot name="photo">
                <AthletePicture :name="name" :slug="slug" size="sm" />
            </slot>
        </div>
        <div class="athlete-info">
            <div class="font-medium">{{ name }}</div>
            <div v-if="countryName" class="text-sm text-gray-500 dark:text-gray-400">{{ countryName }}</div>
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
    countryName: {
        type: String,
        default: ''
    }
});
</script> 