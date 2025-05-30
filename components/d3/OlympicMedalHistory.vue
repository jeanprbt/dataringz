<template>
    <div class="h-full w-full pt-5 relative overflow-hidden">
        <USelect v-model="displayMode" :items="items" :icon="icon" class="w-32" v-if="rank"></USelect>
        <div ref="chartContainer" class="w-full h-full"></div>
    </div>
</template>

<script setup lang="ts">
import countries from '~/data/countries.json';
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
    country: {
        type: String,
        required: true
    }
});

const country = countries[props.country as keyof typeof countries] as any;
const data = country["previous_editions"];
const chartContainer = ref<HTMLElement | null>(null);
const items = ref([
    {
        label: 'Medals',
        value: 'medals',
        icon: 'i-lucide-medal'
    },
    {
        label: 'Rank',
        value: 'rank',
        icon: 'ion:md-podium'
    }
]);

const displayMode = ref(items.value[0]?.value);
const icon = computed(() => items.value.find(item => item.value === displayMode.value)?.icon);
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
const rank = data.at(-1)!["rank"];

const renderChart = () => {
    if (!chartContainer.value) return;

    // Clear previous chart
    d3.select(chartContainer.value).selectAll('*').remove();
    if (!data || data.length === 0) return;

    // Set dimensions
    const containerRect = chartContainer.value.getBoundingClientRect();
    const margin = { top: 40, right: 80, bottom: 100, left: 80 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Create SVG with initial opacity 0 for animation
    const svg = d3.select(chartContainer.value)
        .append('svg')
        .attr('width','100%')
        .attr('height', '100%')
        .style('opacity', 0) // Start with opacity 0 for fade-in animation
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define text color based on dark mode
    const textColor = isDark.value ? '#ffffff' : '#000000';

    // X scale
    const x = d3.scaleLinear()
        .domain(d3.extent(data, (d: any) => d.year) as unknown as [number, number])
        .range([0, width]);

    // Y scale based on display mode
    let yScale;

    if (displayMode.value === 'medals') {
        // Scale for medal counts
        yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: any) => Math.max(d.total, (d.gold) * 1.5)) as number])
            .nice()
            .range([height, 0]);

        // Y axis for medals
        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => d.toString()))
            .selectAll('text')
            .attr('fill', textColor);

        svg.append('text')
            .attr('fill', textColor)
            .attr('y', -30)
            .attr('x', -height / 2)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .text('Nb. of Medals');
    } else {
        // Rank uses an inverted scale (lower rank is better)
        const maxRank: number = d3.max(data, (d: any) => d.rank as number) || 10;
        yScale = d3.scaleLinear()
            .domain([1, maxRank + 2])
            .nice()
            .range([0, height]);

        // Y axis for rank
        svg.append('g')
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .attr('fill', textColor);

        svg.append('text')
            .attr('fill', textColor)
            .attr('y', -30)
            .attr('x', -height / 2)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .text('Rank');
    }

    // No X axis with years - we'll add city labels with years below

    // Line generators
    const createLine = (accessor: (d: any) => number, yScale: d3.ScaleLinear<number, number>) => {
        return d3.line<any>()
            .x(d => x(d.year))
            .y(d => yScale(accessor(d)));
    };

    // Add lines
    const addLine = (accessor: (d: any) => number, color: string, name: string, yScale: d3.ScaleLinear<number, number>, addDots: boolean = false) => {
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', createLine(accessor, yScale))
            .attr('class', name);

        // Add dots if specified (for rank display)
        if (addDots) {
            svg.selectAll(`.dot-${name}`)
                .data(data)
                .enter()
                .append('circle')
                .attr('class', `dot-${name}`)
                .attr('cx', (d: any) => x(d.year))
                .attr('cy', (d: any) => yScale(accessor(d)))
                .attr('r', 4)
                .attr('fill', isDark.value ? 'white' : 'black')
                .on('mouseover', function (event, d: any) {
                    // Show appropriate tooltip based on the name
                    if (name === 'total') {
                        showTooltip(event, d, `${capitalize(d.city)} ${d.year}\nTotal Medals: ${d.total}`);
                    } else if (name === 'rank') {
                        showTooltip(event, d, `${capitalize(d.city)} ${d.year}\nRank: ${d.rank}`);
                    }
                })
                .on('mouseout', hideTooltip);
        }
    };

    // Add lines based on display mode
    if (displayMode.value === 'medals') {
        // First add the totals line as reference
        addLine(d => d.total, isDark.value ? '#EEEEEE' : '#333333', 'total', yScale, true);

        // For cumulative/stacked medal display
        // Bronze at the bottom
        const bronzeArea = d3.area<any>()
            .x(d => x(d.year))
            .y0(height)
            .y1(d => yScale(d.bronze));

        svg.append('path')
            .datum(data)
            .attr('fill', '#CD7F32')
            .attr('opacity', 0.7)
            .attr('d', bronzeArea)
            .attr('class', 'bronze-area');

        // Silver in the middle (bronze + silver)
        const silverArea = d3.area<any>()
            .x(d => x(d.year))
            .y0(d => yScale(d.bronze))
            .y1(d => yScale(d.bronze + d.silver));

        svg.append('path')
            .datum(data)
            .attr('fill', '#C0C0C0')
            .attr('opacity', 0.7)
            .attr('d', silverArea)
            .attr('class', 'silver-area');

        // Gold at the top (bronze + silver + gold)
        const goldArea = d3.area<any>()
            .x(d => x(d.year))
            .y0(d => yScale(d.bronze + d.silver))
            .y1(d => yScale(d.bronze + d.silver + d.gold));

        svg.append('path')
            .datum(data)
            .attr('fill', '#FFD700')
            .attr('opacity', 0.7)
            .attr('d', goldArea)
            .attr('class', 'gold-area');

        // Gold+Silver+Bronze dots
        svg.selectAll('.dot-gold')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot-gold')
            .attr('cx', (d: any) => x(d.year))
            .attr('cy', (d: any) => yScale(d.bronze + d.silver + d.gold))
            .attr('r', 4)
            .attr('fill', isDark.value ? 'white' : 'black')
            .on('mouseover', function (event, d: any) {
                showTooltip(event, d, `${capitalize(d.city)} ${d.year}\nGold: ${d.gold}\nSilver: ${d.silver}\nBronze: ${d.bronze}\nTotal: ${d.total}`);
            })
            .on('mouseout', hideTooltip)
    } else {
        addLine(d => d.rank, '#FF5733', 'rank', yScale, true);
    }

    // Add legend only for medals mode
    if (displayMode.value === 'medals') {
        const legend = svg.append('g')
            .attr('transform', `translate(${width / 2}, ${-margin.top / 2})`);

        const legendItems = [
            { name: 'Total Medals', color: '#333333' },
            { name: 'Gold', color: '#FFD700' },
            { name: 'Silver', color: '#C0C0C0' },
            { name: 'Bronze', color: '#CD7F32' }
        ];

        legendItems.forEach((item, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(${i * 150 - 250}, 0)`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 2)
                .attr('fill', item.color);

            g.append('text')
                .attr('x', 20)
                .attr('y', 5)
                .attr('font-size', '14px')
                .attr('fill', textColor)
                .text(item.name);
        });
    }

    // No title

    // Add city labels with years and flags
    const cityLabels = svg.selectAll('.city-label-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'city-label-group')
        .attr('transform', (d: any) => `translate(${x(d.year)}, ${height + 20})`);

    // Add city and year text
    cityLabels.append('text')
        .attr('class', 'city-label')
        .attr('text-anchor', 'middle')
        .attr('y', 0)
        .style('font-size', '14px')
        .attr('fill', textColor)
        .text((d: any) => `${capitalize(d.city)} ${d.year}`);

    // Add flags if available
    cityLabels.filter((d: any) => d.flag)
        .append('image')
        .attr('xlink:href', (d: any) => d.flag)
        .attr('width', 32) // Increased size
        .attr('height', 24) // Increased size
        .attr('x', -16) // Adjusted center point for larger size
        .attr('y', 6)  // Position below the text
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add progressive left-to-right animation for revealing the chart
    // First make the SVG visible
    d3.select(chartContainer.value)
        .select('svg')
        .style('opacity', 1);

    // Animate paths with stroke dasharray
    svg.selectAll('path')
        .each(function () {
            const path = d3.select(this);
            const totalLength = (this as SVGPathElement).getTotalLength();

            path
                .attr('stroke-dasharray', totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(1200)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        });

    // Fade in dots with delay based on x-position
    svg.selectAll('circle')
        .style('opacity', 0)
        .each(function (d: any) {
            const normalizedX = (x(d.year) - x.range()[0]) / (x.range()[1] - x.range()[0]);
            const delay = normalizedX * 800; // Delay increases from left to right

            d3.select(this)
                .transition()
                .delay(delay)
                .duration(400)
                .style('opacity', 1);
        });

    // Fade in areas
    svg.selectAll('.bronze-area, .silver-area, .gold-area')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 0.7);

    // Progressively reveal city labels and flags
    cityLabels.style('opacity', 0)
        .each(function (d: any) {
            const normalizedX = (x(d.year) - x.range()[0]) / (x.range()[1] - x.range()[0]);
            const delay = normalizedX * 800; // Delay increases from left to right

            d3.select(this)
                .transition()
                .delay(delay)
                .duration(400)
                .style('opacity', 1);
        });
};

// Render chart when country prop changes
watch(() => props.country, renderChart);

// Also re-render when display mode changes
watch(displayMode, renderChart);

// Helper function to capitalize city names
const capitalize = (str: string) => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper functions for tooltips
const showTooltip = (event: MouseEvent, d: any, content: string) => {
    // Get the current target element (the circle that was hovered)
    const target = event.currentTarget as SVGCircleElement;
    // Get the bounding rect of the circle
    const rect = target.getBoundingClientRect();

    // Calculate tooltip position to center above the dot
    const tooltipX = rect.left + (rect.width / 2);
    const tooltipY = rect.top - 10; // Position above the dot with a small gap

    const tooltip = d3.select(chartContainer.value)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'fixed') // Use fixed instead of absolute for more reliable positioning
        .style('background-color', isDark.value ? '#333' : 'white')
        .style('color', isDark.value ? 'white' : 'black')
        .style('border', isDark.value ? '1px solid #555' : '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '6px')
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('box-shadow', isDark.value ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)')
        .style('transform', 'translate(-50%, -100%)') // Center horizontally and position above
        .style('opacity', 0);

    // Replace newlines with HTML breaks to properly format the tooltip
    const formattedContent = content.replace(/\n/g, '<br>');

    tooltip
        .html(formattedContent)
        .style('left', tooltipX + 'px')
        .style('top', tooltipY + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
};

const hideTooltip = () => {
    d3.select(chartContainer.value)
        .selectAll('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
};

onMounted(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });
});
</script>
