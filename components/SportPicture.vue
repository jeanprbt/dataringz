<template>
    <div class="bg-gray-200 rounded-lg overflow-hidden" :class="sizeClasses">
        <img :src="`/img/sports/SVG/${slug}.svg`" :alt="`Icon of ${name}`" class="w-full h-full object-contain p-1" />
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