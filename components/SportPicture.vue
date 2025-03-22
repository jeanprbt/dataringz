<template>
    <div class="bg-white dark:bg-zinc-700 overflow-hidden rounded-lg shadow border border-zinc-200 dark:border-zinc-600" :class="sizeClasses">
        <img :src="`/img/sports/SVG/${slug}.svg`" :alt="`Icon of ${name}`" 
             class="w-full h-full object-contain p-1 dark:filter dark:invert dark:brightness-90" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'md',
        validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    }
});

// Size classes based on the size prop
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-8 h-8';
        case 'lg': return 'w-24 h-24';
        default: return 'w-12 h-12'; // md size
    }
});
</script>