<template>
    <div v-if="show" :class="['fixed h-full w-full flex items-center justify-center z-1', modalBackgroundClass]"
        @click="close">
        <div :class="['relative rounded-lg p-6 w-[80%] h-[80%] overflow-auto', modalShapeClass]" @click.stop>
            <div
                :class="['flex items-center mb-4 opacity-0 justify-between', modalHeaderClass]">
                <UBreadcrumb :items="items"
                    class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" />
                <button @click="close"
                    class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div :class="['opacity-0', modalContentClass]">
                <slot></slot>
            </div>
            <svg class="absolute top-0 left-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="none" stroke-width="8" stroke-dasharray="400%" rx="8" ry="8"
                    stroke-dashoffset="400%" :class="['stroke-white dark:stroke-zinc-700', modalRectangleClass]" />
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
    }
});
const emit = defineEmits(['close', 'back']);

const items = toRef(props, "items");

const exit = ref(false);
const modalBackgroundClass = computed(() => exit.value ? 'animate-modal-background-exit' : props.transition ? 'bg-black/70' : 'animate-modal-background');
const modalShapeClass = computed(() => exit.value ? 'animate-modal-shape-light-exit dark:animate-modal-shape-dark-exit' : props.transition ? 'bg-white dark:bg-zinc-800' : 'animate-modal-shape-light dark:animate-modal-shape-dark');
const modalContentClass = computed(() => exit.value ? 'animate-modal-content-exit' : props.transition ? 'animate-modal-content-transition' : 'animate-modal-content');
const modalHeaderClass = computed(() => exit.value ? 'animate-modal-content-exit' : props.transition ? 'opacity-100' : 'animate-modal-content');
const modalRectangleClass = computed(() => props.transition ? '' : 'animate-modal-rectangle');

const close = () => {
    exit.value = true;
    setTimeout(() => {
        emit('close');
    }, 500);
}
</script>