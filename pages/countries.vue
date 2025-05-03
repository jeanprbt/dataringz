<template>
    <button ref="searchButton" @click="searchButtonClicked"
        class="absolute flex items-center top-5 left-1/2 transform -translate-x-1/2 text-zinc-500 hover:text-zinc-400 dark:text-zinc-400 hover:dark:text-zinc-500 px-4 py-2 rounded-lg shadow-sm backdrop-blur-2xl border-1 border-zinc-300 hover:border-zinc-200 dark:border-zinc-600 hover:dark:border-zinc-700 whitespace-nowrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 mr-2">
            <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clip-rule="evenodd" />
        </svg>
        country...
        <UKbd value="meta" size="sm" class="ml-2 mr-1 text-zinc-500 dark:text-zinc-400 bg-transparent"></UKbd>
        <UKbd value="K" size="sm" class="text-zinc-500 dark:text-zinc-400 bg-transparent">K</UKbd>
    </button>
    <UModal v-model:open="open" class="w-[80%] md:w-[35%] h-auto bg-opacity-0 backdrop-blur-3xl rounded-xl"
        :overlay="false" :ui="{ content: 'ring-zinc-300 dark:ring-zinc-600' }">
        <template #content>
            <UCommandPalette :groups="groups" placeholder="country..." @highlight="onHighlight"
                :ui="{ root: 'divide-zinc-300 dark:divide-zinc-600', label: 'text-zinc-500 dark:text-zinc-400', itemLabelBase: 'text-zinc-500 dark:text-zinc-400', viewport: 'divide-zinc-300 dark:divide-zinc-600', itemLeadingAvatar: 'bg-transparent dark:invert brightness-100' }">
            </UCommandPalette>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui';

import countries from '~/data/countries.json';

definePageMeta({
    layout: 'globe'
})

// COMPOSABLES ------------------------------------------------------------------------------------------------------ //
const router = useRouter();
const { globe } = useGlobe();

// COMMAND PALETTE ---------------------------------------------------------------------------------------------- //
const groups = ref<any[]>([]);
let flying: boolean = false;
const createGroups = (globe: mapboxgl.Map) => {
    groups.value.push({
        id: "countries",
        label: "Countries",
        items: Object.keys(countries).map(key => {
            let country = countries[key as keyof typeof countries];
            return {
                label: country.name,
                async onSelect() {
                    open.value = false;
                    const coordinates = [country.location.longitude, country.location.latitude] as [number, number];
                    flying = true;
                    await flyToCountry(globe, coordinates);
                    flying = false;
                    // router.push( `/country/${country.slug}`);
                }
            }
        })
    })
}
// @ts-ignore
if (globe.value) createGroups(globe.value);
else watch(globe, (newGlobe) => {
    if (newGlobe) {
        createGroups(newGlobe as mapboxgl.Map)
    }
})

// COMMAND PALETTE HIGHLIGHT LOGIC -------------------------------------------------------------------------------------------- //
const highlightedElem = ref<HTMLElement | null>(null);
const onHighlight = (payload: { ref: HTMLElement, value: CommandPaletteItem } | undefined) => {
    if (highlightedElem.value !== null) {
        highlightedElem.value!.classList.remove('bg-zinc-200');
        highlightedElem.value!.classList.remove('dark:bg-zinc-700')
    }
    highlightedElem.value = payload!.ref
    payload!.ref.classList.add('bg-zinc-200');
    payload!.ref.classList.add('dark:bg-zinc-700');
    payload!.ref.classList.add('rounded-lg');
}

// SEARCH BUTTON LOGIC ---------------------------------------------------------------------------------------------- //
const open = ref(false);
const searchButton = ref<HTMLElement | null>(null);
const showSearchButton = ref<boolean>(false);
const searchButtonClicked = () => {
    open.value = true;
    hideButton(showSearchButton, searchButton, 0)
}
defineShortcuts({
    meta_k: searchButtonClicked,
    escape: () => {
        open.value = false;
    }
})
watch(open, async (newVal) => {
    if (newVal) {
        hideButton(showSearchButton, searchButton, 0)
    } else if (!flying) {
        displayButton(showSearchButton, searchButton, 0.2, 0.5)
    }
})


</script>