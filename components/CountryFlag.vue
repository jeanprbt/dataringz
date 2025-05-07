<template>
    <img v-if="code" 
         :src="`/img/countries/${code.toLowerCase()}.svg`"
         :alt="`Flag of ${name}`"
         :class="['object-cover', sizeClasses]"
    />
</template>

<script setup lang="ts">
const props = defineProps({
    code: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'sm',
        validator: (value: string) => ['xs', 'sm', 'md', 'lg'].includes(value)
    }
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs': return 'h-2 w-3';
        case 'sm': return 'h-3 w-4';
        case 'md': return 'h-4 w-5';
        case 'lg': return 'h-5 w-6';
        default: return 'h-3 w-4';
    }
});
</script> 