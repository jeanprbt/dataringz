<template>
    <div class="w-full h-full" ref="chartContainer"></div>
</template>

<script setup>
import * as d3 from 'd3';
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Container refs
const chartContainer = ref(null);
const svg = ref(null);
const animationTimer = ref(null);

// Animation state
const animationProgress = ref(0);
const isAnimating = ref(false);
const animationDuration = 3000;

// Chart dimensions
const width = ref(0);
const height = ref(0);
const margin = { top: 20, right: 30, bottom: 20, left: 30 };

// Generate some fake data for the preview
const generatePreviewData = () => {
    const numCountries = 10;
    const numSteps = 10;
    const countries = [];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    for (let i = 0; i < numCountries; i++) {
        const countryPath = {
            id: `country-${i}`,
            color: colorScale(i),
            points: []
        };
        let rank = Math.floor(Math.random() * 15) + 1;
        for (let step = 0; step <= numSteps; step++) {
            rank = Math.max(1, Math.min(20, rank + (Math.random() * 6 - 3)));
            countryPath.points.push({
                x: step / numSteps,
                y: rank
            });
        }
        countries.push(countryPath);
    }
    return countries;
}

const initializeChart = () => {
    if (!chartContainer.value) return;

    width.value = chartContainer.value.clientWidth;
    height.value = chartContainer.value.clientHeight;

    // Create SVG element
    svg.value = d3.select(chartContainer.value)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width.value} ${height.value}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define scales
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width.value - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([20.5, 0.5])  // Reversed to have rank 1 at the top
        .range([height.value - margin.bottom, margin.top]);

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(0).tickSize(0);
    const yAxis = d3.axisLeft(yScale).ticks(0).tickSize(0);

    svg.value.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height.value - margin.bottom})`)
        .call(xAxis)
        .call(g => g.select('.domain').attr('stroke', '#ccc'));  // Only show the line

    svg.value.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .call(g => g.select('.domain').attr('stroke', '#ccc'));  // Only show the line

    // Create a group for lines
    const linesGroup = svg.value.append('g').attr('class', 'lines-group');

    // Generate preview data
    const data = generatePreviewData();

    // Create line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

    // Add path for each country
    data.forEach(country => {
        const linePath = linesGroup.append('path')
            .attr('d', lineGenerator(country.points))
            .attr('fill', 'none')
            .attr('stroke', country.color)
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
            
        // Set up the path for animation
        const pathLength = linePath.node().getTotalLength();
        
        linePath
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength);
    });
    
    // Start the animation immediately
    startAnimation();
}

const startAnimation = () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    animationProgress.value = 0;
    const startTime = Date.now();
    const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        animationProgress.value = elapsed / animationDuration;
        if (animationProgress.value >= 1) {
            animationProgress.value = 1;
            isAnimating.value = false;
            updateAnimation(1);
            return;
        }
        updateAnimation(animationProgress.value);
        animationTimer.value = requestAnimationFrame(animate);
    };
    animate();
};

const updateAnimation = (progress) => {
    if (!svg.value) return;
    const paths = svg.value.selectAll('.lines-group path');
    paths.each(function() {
        const pathLength = this.getTotalLength();
        const dashOffset = pathLength * (1 - progress);
        d3.select(this)
            .attr('stroke-dashoffset', dashOffset);
    });
};

const cleanupChart = () => {
    if (animationTimer.value) {
        cancelAnimationFrame(animationTimer.value);
        animationTimer.value = null;
    }
    if (svg.value) {
        svg.value.remove();
        svg.value = null;
    }
};

// Lifecycle hooks
onMounted(() => {
    initializeChart();
});

onBeforeUnmount(() => {
    cleanupChart();
});
</script>