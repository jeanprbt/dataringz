<template>
    <button class="ml-2 text-xs text-zinc-800 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-zinc-400 hover:underline transition-colors" @click="$emit('toggle')">
        {{ showingAll ? 'Show less' : `Show all (${total})` }}
    </button>
</template>

<script setup lang="ts">
defineProps<{
    showingAll: boolean;
    total: number;
}>();

defineEmits<{
    toggle: [];
}>();
</script>