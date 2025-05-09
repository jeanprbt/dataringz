<template>
    <div v-if="show" :class="['fixed h-full w-full flex items-center justify-center z-10', modalBackgroundClass]"
        @click="close">
        <div :class="['relative rounded-xl flex flex-col max-w-7xl p-1 w-[95%] md:w-[90%] h-[95%] md:h-[90%] overflow-hidden', modalShapeClass]"
            @click.stop>
            <div :class="['sticky top-0 z-10 flex items-center py-4 px-4 opacity-0 justify-between', modalHeaderClass]">
                <button v-if="back && isSmallScreen" @click="emit('back')"
                    class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <UBreadcrumb v-else :items="items" class="text-zinc-500 dark:text-zinc-400"
                    :ui="{ link: 'hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors' }" />
                <button @click="close"
                    class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div :class="['flex-1 px-4 pb-4 overflow-auto', modalContentContainerClass]">
                <div :class="['opacity-0', modalContentClass]">
                    <slot></slot>
                </div>
            </div>
            <svg class="absolute top-0 left-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="none" stroke-width="6" stroke-dasharray="400%" rx="12" ry="12"
                    stroke-dashoffset="400%"
                    :class="['stroke-white dark:stroke-zinc-700', modalRectangleClass]" />
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';

const props = defineProps({
    show: {
        type: Boolean,
        default: true
    },
    back: {
        type: Boolean,
        default: false
    },
    transition: {
        type: Boolean,
        default: false
    },
    items: {
        type: Array<BreadcrumbItem>,
        default: []
    },
    countries: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['close', 'back']);
const items = toRef(props, "items");

// UI STATE
const exit = ref(false);
const modalBackgroundClass = computed(() => exit.value ? props.countries ? 'animate-modal-background-countries-exit' : 'animate-modal-background-exit' : props.transition ? 'bg-black/70' : props.countries ? 'animate-modal-background dark:animate-modal-background-countries' : 'animate-modal-background');
const modalShapeClass = computed(() => exit.value ? 'animate-modal-shape-light-exit dark:animate-modal-shape-dark-exit' : props.transition ? 'bg-white dark:bg-zinc-800' : 'animate-modal-shape-light dark:animate-modal-shape-dark');
const modalContentClass = computed(() => exit.value ? 'animate-modal-content-exit' : props.transition ? 'animate-modal-content-transition' : 'animate-modal-content');
const modalHeaderClass = computed(() => exit.value ? 'animate-modal-content-exit' : props.transition ? 'opacity-100' : 'animate-modal-content');
const modalContentContainerClass = computed(() => exit.value ? 'opacity-0' : 'opacity-100');
const modalRectangleClass = computed(() => props.transition ? '' : 'animate-modal-rectangle');

// HANDLE SMALL SCREENS
const isSmallScreen = ref(false);
onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
})

const close = () => {
    exit.value = true;
    setTimeout(() => {
        emit('close');
    }, 500);
}
</script>