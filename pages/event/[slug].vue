<template>
    <PageModal :show="showEventPage" :transition="transition" :items="items" @close="closePage">
    </PageModal>
</template>

<script setup lang="ts">
import sports from '~/data/sports.json';

definePageMeta({
    middleware: ['previous', 'breadcrumb'],
    layout: 'canvas'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('event').value;
const showEventPage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showEventPage.value = true, 4200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const event = sports[slug as keyof typeof sports];

// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previousCard = useState('previous');
const transition = computed(() => previousCard.value && previousCard.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showEventPage.value = false;
    router.push('/');
}
</script>