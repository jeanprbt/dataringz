<template>
    <PageModal :show="showCountryPage" :transition="false" :countries="true" @close="closePage">
        <h1>{{ country.name }}</h1>
    </PageModal>
</template>

<script setup lang="ts">
import countries from '~/data/countries.json';

definePageMeta({
    middleware: ['country'],
    layout: 'globe'
})

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('country').value;
const showCountryPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showCountryPage.value = true, 2200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const country = countries[slug as keyof typeof countries];

// HANDLE CLOSE BUTTON -------------
const closePage = () => {
    showCountryPage.value = false;
    router.push('/countries/');
}
</script>