<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex flex-wrap justify-left items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Compare with</span>
            <USelectMenu v-model="selectedItem" :avatar="selectedItem?.avatar" :items="items" class="w-64" />
        </div>
        <div ref="chartContainer" class="flex-1 w-full min-h-[40vh]"></div>
        <div class="flex flex-wrap items-center justify-center text-sm mt-2 gap-4">
            <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 opacity-80 mr-1 rounded"></div>
                <span class="text-xs sm:text-sm">{{ currentSportName }}</span>
            </div>
            <div class="flex items-center">
                <div class="w-3 h-3 bg-gray-400 opacity-80 mr-1 rounded"></div>
                <span class="text-xs sm:text-sm">{{ compareSportName }}</span>
            </div>
        </div>
    </div>
    <div ref="tooltip" class="absolute hidden bg-white dark:bg-zinc-800 p-2 rounded shadow-lg text-sm" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import * as d3 from 'd3';
import athletes from '~/data/athletes.json';
import sports from '~/data/sports.json';


const props = defineProps({
    sportSlug: {
        type: String,
        required: true,
    },
});

const chartContainer = ref<HTMLDivElement | null>(null);
const tooltip = ref<HTMLDivElement | null>(null);
const compareSlug = ref('average');

const allSports = Object.values(sports)
    .filter((s: any) => s.slug && s.name && s.icon)
    .map((s: any) => ({
        slug: s.slug,
        name: s.name,
        icon: s.icon,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const itemsWithIcons = ref([
    { label: 'Average (All Sports)', value: 'average', icon: '/img/olympics.svg' },
    ...allSports.map(sport => ({
        label: sport.name,
        value: sport.slug,
        icon: sport.icon
    }))
]);

const items = ref(
    itemsWithIcons.value.map(({ label, value, icon }) => ({
        label,
        value,
        avatar: {
            src: icon,
            alt: label
        }
    }))
);


const selectedItem = ref(items.value[0]);

const compareSportName = computed(() => {
    if (compareSlug.value === 'average') return 'Average (All Sports)';
    const sport = allSports.find(s => s.slug === compareSlug.value);
    return sport ? sport.name : 'Comparison';
});

// Computed properties for displaying the current sport names
const currentSportName = computed(() => {
    const sport = allSports.find(s => s.slug === props.sportSlug);
    return sport ? sport.name : 'Selected Sport';
});

const createHistogram = () => {
    if (!chartContainer.value) return;

    d3.select(chartContainer.value).selectAll('*').remove();

    // Get the container dimensions
    const containerWidth = chartContainer.value.clientWidth || 600;
    const containerHeight = chartContainer.value.clientHeight || 400;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth * 0.9;
    const height = containerHeight;

    const getAges = (slug: string) => {
        return Object.values(athletes)
            .filter((a: any) => a.age && (slug === 'average' || a.sports?.some((s: any) => s.slug === slug)))
            .map((a: any) => a.age);
    };

    const primaryAges = getAges(props.sportSlug);
    const compareAges = getAges(compareSlug.value);

    // Get all ages to ensure same bins
    const allAges = [...primaryAges, ...compareAges];

    // Create consistent bins across both datasets that are multiples of 5
    const ageExtent = d3.extent(allAges) as [number, number];

    // Round min down and max up to nearest multiple of 5
    const ageMin = Math.floor(ageExtent[0] / 5) * 5;
    const ageMax = Math.ceil(ageExtent[1] / 5) * 5;

    // Create explicit bin thresholds at multiples of 5
    const thresholds = [];
    for (let age = ageMin; age <= ageMax; age += 5) {
        thresholds.push(age);
    }

    // Create the bins with the same thresholds for both datasets
    const binsGenerator = d3.bin().domain([ageMin, ageMax]).thresholds(thresholds);
    const primaryBins = binsGenerator(primaryAges);
    const compareBins = binsGenerator(compareAges);

    // Set up scales
    const x = d3.scaleLinear()
        .domain([ageMin, ageMax])
        .range([margin.left, width - margin.right]);

    const primaryTotal = primaryAges.length;
    const compareTotal = compareAges.length;

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select(chartContainer.value)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Match up the bins by index to ensure they're aligned
    const combinedData = primaryBins.map((primaryBin, index) => {
        const compareBin = (index < compareBins.length) ? compareBins[index] : { x0: primaryBin.x0, x1: primaryBin.x1, length: 0 };
        return {
            x0: primaryBin.x0,
            x1: primaryBin.x1,
            primary: primaryBin,
            compare: compareBin
        };
    });

    // Helper function to format bin range
    const formatBinRange = (bin: any) => {
        return `${Math.round(bin.x0!)}-${Math.round(bin.x1!)}`;
    };

    // Helper function to get sport name
    const getSportName = (slug: string) => {
        if (slug === 'average') return 'All Sports';
        return (sports as any)[slug]?.name || slug;
    };

    const primarySportName = getSportName(props.sportSlug);
    const compareSportName = getSportName(compareSlug.value);

    const calculateBarWidth = (d: any) => {
        const binWidth = x(d.x1!) - x(d.x0!);
        return binWidth * 0.495;
    };

    // Create pairs of bars
    const barGroup = svg.append('g');

    const pairs = barGroup.selectAll('.bar-pair')
        .data(combinedData)
        .enter()
        .append('g')
        .attr('class', 'bar-pair');

    // Primary bars (left side of each bin)
    const primaryBars = pairs.append('rect')
        .attr('class', 'primary-bar')
        .attr('x', d => x(d.x0!))
        .attr('y', d => y((d.primary.length / primaryTotal) * 100))
        .attr('height', d => Math.max(0, y(0) - y((d.primary.length / primaryTotal) * 100)))
        .attr('width', d => calculateBarWidth(d))
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.7)
        .attr('rx', 1)
        .attr('cursor', 'pointer');

    // Compare bars (right side of each bin)
    const compareBars = pairs.append('rect')
        .attr('class', 'compare-bar')
        .attr('x', d => x(d.x0!) + calculateBarWidth(d) + 1) // Add 1px gap for visual separation
        .attr('y', d => y((d.compare.length / compareTotal) * 100))
        .attr('height', d => Math.max(0, y(0) - y((d.compare.length / compareTotal) * 100)))
        .attr('width', d => calculateBarWidth(d))
        .attr('fill', '#9ca3af')
        .attr('opacity', 0.7)
        .attr('rx', 1)
        .attr('cursor', 'pointer');

    // Add event handlers to primary bars
    primaryBars
        .on('mouseover', function (event, d) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('fill', '#1a68c7');

            // Dim all compare bars
            compareBars
                .attr('opacity', 0.4);

            if (!tooltip.value) return;

            const primaryPercentage = ((d.primary.length / primaryTotal) * 100).toFixed(1);

            tooltip.value.innerHTML = `
          <div>
            <div class="font-medium">${primarySportName}, ${formatBinRange(d)}: ${primaryPercentage}% (${d.primary.length} athletes)</div>
          </div>
        `;
            tooltip.value.style.display = 'block';
            tooltip.value.style.left = `${event.offsetX + 10}px`;
            tooltip.value.style.top = `${event.offsetY - 30}px`;
        })
        .on('mouseout', function () {
            // Reset all bars
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('fill', '#3b82f6');


            compareBars
                .attr('opacity', 0.8);

            if (tooltip.value) tooltip.value.style.display = 'none';
        })
        .on('mousemove', function (event) {
            if (!tooltip.value) return;
            tooltip.value.style.left = `${event.offsetX + 10}px`;
            tooltip.value.style.top = `${event.offsetY - 30}px`;
        });

    // Add event handlers to compare bars
    compareBars
        .on('mouseover', function (event, d) {
            // Highlight all compare bars
            d3.select(this)
                .attr('opacity', 1)
                .attr('fill', '#6b7280');

            // Dim all primary bars
            primaryBars
                .attr('opacity', 0.4);

            if (!tooltip.value) return;

            const comparePercentage = ((d.compare.length / compareTotal) * 100).toFixed(1);

            tooltip.value.innerHTML = `
          <div>
            <div class="font-medium">${compareSportName}, ${formatBinRange(d)}: ${comparePercentage}% (${d.compare.length} athletes)</div>
          </div>
        `;
            tooltip.value.style.display = 'block';
            tooltip.value.style.left = `${event.offsetX + 10}px`;
            tooltip.value.style.top = `${event.offsetY - 30}px`;
        })
        .on('mouseout', function () {
            // Reset all bars
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('fill', '#9ca3af');


            primaryBars
                .attr('opacity', 0.8);

            if (tooltip.value) tooltip.value.style.display = 'none';
        })
        .on('mousemove', function (event) {
            if (!tooltip.value) return;
            tooltip.value.style.left = `${event.offsetX + 10}px`;
            tooltip.value.style.top = `${event.offsetY - 30}px`;
        });

    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(thresholds))
        .attr('font-size', '10px');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
        .attr('font-size', '10px');

    // Add gridlines for better readability
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
            d3.axisBottom(x)
                .tickValues(thresholds)
                .tickSize(-(height - margin.top - margin.bottom))
                .tickFormat(() => '')
        )
        .attr('stroke-opacity', 0.1);

    // Add axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#6b7280')
        .text('Age (years)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(height / 2))
        .attr('y', 1)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#6b7280')
        .text('Percentage of Athletes (%)');
};

// Add resize handler
const handleResize = () => {
    createHistogram();
};

onMounted(() => {
    createHistogram();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

watch(() => [props.sportSlug, compareSlug.value], createHistogram);
watch(selectedItem, (newVal) => {
    compareSlug.value = newVal.value;
});

</script>