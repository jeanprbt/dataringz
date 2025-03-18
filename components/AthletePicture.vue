<template>
    <div class="bg-gray-200 rounded-full overflow-hidden" :class="sizeClasses">
        <img v-if="photoSrc && !imageError" 
             :src="photoSrc" 
             :alt="`Photo of ${name}`" 
             class="w-full h-full object-cover"
             @error="handleImageError" />
        <div v-else 
             class="w-full h-full flex items-center justify-center text-white font-bold"
             :class="initialsClasses"
             :style="{ backgroundColor: getBackgroundColor() }">
            {{ getInitials(name) }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'md',
        validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    }
});

const imageError = ref(false);

// Determine the photo source based on slug
const photoSrc = computed(() => {
    if (props.slug) {
        return `/img/athletes/${props.slug}.jpg`;
    }
    return '';
});

// Size classes based on the size prop
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-8 h-8';
        case 'lg': return 'w-24 h-24';
        default: return 'w-12 h-12'; // md size
    }
});

// Text size for initials
const initialsClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'text-xs';
        case 'lg': return 'text-2xl';
        default: return 'text-sm'; // md size
    }
});

// function to get initials from a name
function getInitials(name: string): string {
    if (!name) return '?';
    
    // If slug is available, use it for initials
    if (props.slug) {
        return props.slug
            .split('-')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
    
    // Fallback to using name
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getBackgroundColor(): string {
    if (!props.slug) return '#6B7280'; // default gray

    // generate a hash code from the slug
    let hash = 0;
    for (let i = 0; i < props.slug.length; i++) {
        hash = props.slug.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        '#3B82F6',
        '#EF4444',
        '#10B981',
        '#F59E0B',
        '#8B5CF6',
        '#EC4899',
        '#06B6D4',
        '#F97316',
        '#6366F1',
        '#14B8A6',
    ];

    return colors[Math.abs(hash) % colors.length];
}

function handleImageError() {
    imageError.value = true;
}
</script> 