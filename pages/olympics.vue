<template>
    <PageModal :show="showOlympicsPage" :transition="false" @close="closePage">
        <h1>Olympics</h1>
    </PageModal>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['olympics'],
    layout: 'canvas'
})

// HANDLE DIRECT URL ---------------
let directAccess = useState('olympics').value;
const showOlympicsPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showOlympicsPage.value = true, 4200);
    }
});

// HANDLE CLOSE BUTTON -------------
const router = useRouter();
const closePage = () => {
    showOlympicsPage.value = false;
    router.push('/');
}
</script>