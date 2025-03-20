<template>
    <button class="ml-2 text-xs text-primary hover:underline" @click="$emit('toggle')">
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