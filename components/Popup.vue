<template>
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" @click="closePopup">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-[90%] max-h-[90%] overflow-auto transform transition-all duration-300 ease-in-out" @click.stop>
            <h3 class="text-md text-gray-800 dark:text-white">{{ title }}</h3>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true
    },
});

const emit = defineEmits(['close']);

function closePopup() {
    emit('close');
}
</script>