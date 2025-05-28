<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex flex-wrap justify-left items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Compare</span>
            <div
                class="min-w-[12rem] max-w-[16rem] w-fit relative inline-flex items-center px-3 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg">
                <div class="flex items-center gap-2 flex-1">
                    <img :src="currentSportIcon" :alt="currentSportName"
                        class="w-6 h-6 rounded-full object-cover dark:invert dark:brightness-100" />
                    <span class="text-sm text-gray-900 dark:text-white truncate">{{ currentSportName }}</span>
                </div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">with</span>
            <USelectMenu v-model="selectedItem" :avatar="selectedItem?.avatar" :items="items" class="w-64" />
        </div>
        <div ref="chartContainer" class="flex-1 w-full min-h-[40vh]"></div>
        <div class="flex flex-wrap items-center justify-center text-sm mt-2 gap-4">
            <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 opacity-80 mr-1 rounded"></div>
                <span class="text-xs sm:text-sm">{{ currentSportName }}</span>
            </div>
            <div class="flex items-center">
                <div class="w-3 h-3 bg-[#f97316] opacity-80 mr-1 rounded"></div>
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
    ...allSports.map(sport => ({
        label: sport.name,
        value: sport.slug,
        icon: sport.icon
    }))
]);

const items = computed(() => {
    const baseItems = [
        { label: 'Average (All Sports)', value: 'average', avatar: { src: '/img/olympics.svg', alt: 'olympics' } },
        ...itemsWithIcons.value
            .filter(item => item.value !== props.sportSlug) // Filter out current sport
            .map(({ label, value, icon }) => ({
                label,
                value,
                avatar: {
                    src: icon,
                    alt: label,
                    class: 'dark:invert dark:brightness-100 bg-transparent'
                }
            }))
    ];
    return baseItems;
});


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

// Add new computed property for current sport icon
const currentSportIcon = computed(() => {
    const sport = allSports.find(s => s.slug === props.sportSlug);
    return sport ? sport.icon : '/img/olympics.svg';
});

const getAges = (slug: string) => {
    const filteredAthletes = Object.values(athletes)
        .filter((a: any) => a.age && (slug === 'average' || a.sports?.includes(slug)));
    const ages = filteredAthletes.map((a: any) => a.age);
    return ages;
};


const createHistogram = () => {
    if (!chartContainer.value) {
        return;
    }

    d3.select(chartContainer.value).selectAll('*').remove();

    // Get the container dimensions
    const containerWidth = chartContainer.value.clientWidth || 600;
    const containerHeight = chartContainer.value.clientHeight || 400;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth * 0.9;
    const height = containerHeight;

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
        return binWidth * 0.5;
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
        .attr('y', y(0)) // Start from the bottom
        .attr('height', 0) // Start with height 0 for animation
        .attr('width', d => calculateBarWidth(d))
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.9)  // slightly increase default opacity
        .attr('rx', 1)
        .attr('cursor', 'pointer');
        
    // Animate primary bars growing up
    primaryBars.transition()
        .duration(800)
        .delay((d, i) => i * 40) // Stagger the animations
        .ease(d3.easeCubicOut) // Smooth easing
        .attr('y', d => y((d.primary.length / primaryTotal) * 100))
        .attr('height', d => Math.max(0, y(0) - y((d.primary.length / primaryTotal) * 100)));

    // Compare bars (right side of each bin)
    const compareBars = pairs.append('rect')
        .attr('class', 'compare-bar')
        .attr('x', d => x(d.x0!) + calculateBarWidth(d))
        .attr('y', y(0)) // Start from bottom for animation
        .attr('height', 0) // Start with height 0 for animation
        .attr('width', d => calculateBarWidth(d))
        .attr('fill', '#f97316')  // Brighter orange
        .attr('opacity', 0.9)
        .attr('rx', 1)
        .attr('cursor', 'pointer');
        
    // Animate comparison bars growing up after a slight delay
    compareBars.transition()
        .duration(800)
        .delay((d, i) => 200 + i * 40) // Slightly delayed compared to primary bars
        .ease(d3.easeCubicOut) // Smooth easing
        .attr('y', d => y((d.compare.length / compareTotal) * 100))
        .attr('height', d => Math.max(0, y(0) - y((d.compare.length / compareTotal) * 100)));

    // Add event handlers to primary bars
    primaryBars
        .on('mouseover', function (event, d) {
            // Highlight this specific bar
            d3.select(this)
                .attr('opacity', 1)
                .attr('fill', '#1a68c7');  // darker blue for primary hover

            // Dim all other bars significantly
            primaryBars
                .filter(pd => pd !== d)
                .attr('opacity', 0.2);

            compareBars
                .attr('opacity', 0.2);

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
            // Reset all bars to original opacity
            primaryBars
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
            // Highlight this specific bar
            d3.select(this)
                .attr('opacity', 1)
                .attr('fill', '#ea580c');  // Darker version of the bright orange for hover

            // Dim all other bars significantly
            compareBars
                .filter(cd => cd !== d)
                .attr('opacity', 0.2);

            primaryBars
                .attr('opacity', 0.2);

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
            // Reset all bars to original opacity
            primaryBars
                .attr('opacity', 0.8);

            compareBars
                .attr('opacity', 0.8)
                .attr('fill', '#f97316');

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
        .text('Percentage of Athletes (%)')
        .style('opacity', 0) // Start invisible
        .transition()
        .duration(600)
        .delay(800) // Appear after bars have started animating
        .style('opacity', 1);
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

// Update selectedItem to use the first item when sport changes
watch(() => props.sportSlug, () => {
    selectedItem.value = items.value[0];
}, { immediate: true });

</script>