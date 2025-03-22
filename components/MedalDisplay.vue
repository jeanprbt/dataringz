<template>
    <div v-if="medals" class="flex space-x-3">
        <div v-if="medals.gold > 0" class="flex items-center" title="Gold medals">
            <UIcon name="i-fluent-emoji-flat-1st-place-medal" class="h-5 w-5" />
            <span class="ml-1 text-sm text-zinc-700 dark:text-zinc-300">{{ medals.gold }}</span>
        </div>
        <div v-if="medals.silver > 0" class="flex items-center" title="Silver medals">
            <UIcon name="i-fluent-emoji-flat-2nd-place-medal" class="h-5 w-5" />
            <span class="ml-1 text-sm text-zinc-700 dark:text-zinc-300">{{ medals.silver }}</span>
        </div>
        <div v-if="medals.bronze > 0" class="flex items-center" title="Bronze medals">
            <UIcon name="i-fluent-emoji-flat-3rd-place-medal" class="h-5 w-5" />
            <span class="ml-1 text-sm text-zinc-700 dark:text-zinc-300">{{ medals.bronze }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Medals } from '~/types/olympics';

defineProps<{
    medals: Medals;
}>();
</script>