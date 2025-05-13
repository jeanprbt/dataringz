<template>
    <div class="bg-gray-200 rounded-full overflow-hidden" :class="sizeClasses">
        <img v-if="shouldShowImage" :src="`/storage/athletes/images/${slug}.jpg`" 
             class="w-full h-full object-cover" 
             :alt="name" />
        <div
             v-else
             class="w-full h-full flex items-center justify-center text-white font-bold"
             :class="initialsClasses"
             :style="{ backgroundColor: getBackgroundColor() }">
            {{ getInitials(name) }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import athletes from '../data/athletes.json';

interface AthleteImage {
    has_image: boolean;
    is_verified_athlete: boolean;
    should_show_image: boolean;
    wikidata_id?: string | null;
    verification_date?: string;
}

interface Athlete {
    name: string;
    slug: string;
    image?: AthleteImage;
    // other athlete properties
}

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

const shouldShowImage = computed(() => {
    if (!props.slug) return false;
    
    const athlete = (athletes as Record<string, Athlete>)[props.slug];
    
    // check if we have the athlete and the image information
    if (!athlete || !athlete.image) return false;
    
    // use the pre-computed value from our merged data
    return athlete.image.should_show_image;
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
    if (!props.slug) return '#6B7280';

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
</script> 