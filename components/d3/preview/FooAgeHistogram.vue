<template>
    <div class="w-full h-full" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as d3 from 'd3';

// Container ref
const chartContainer = ref(null);

// Animation state
const animationTimer = ref(null);
const lastCardState = ref(null);

// Generate mock data for preview
const generatePreviewData = () => {
    return [
        { ageGroup: '15-20', primary: 10, compare: 8 },
        { ageGroup: '20-25', primary: 25, compare: 18 },
        { ageGroup: '25-30', primary: 20, compare: 22 },
        { ageGroup: '30-35', primary: 15, compare: 12 },
        { ageGroup: '35-40', primary: 5, compare: 7 }
    ];
};

// Create and animate the chart
function createChart() {
    if (!chartContainer.value) return;
    
    // Clean up any existing chart
    cleanupChart();
    d3.select(chartContainer.value).selectAll('*').remove();
    
    // Get container dimensions
    const containerRect = chartContainer.value.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set up margins
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Get data
    const data = generatePreviewData();
    
    // Create SVG
    const svg = d3.select(chartContainer.value)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Add a group for the chart content
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Scales
    const x0 = d3.scaleBand()
        .domain(data.map(d => d.ageGroup))
        .rangeRound([0, innerWidth])
        .paddingInner(0.3);
    
    const x1 = d3.scaleBand()
        .domain(['primary', 'compare'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.primary, d.compare)) * 1.1])
        .nice()
        .rangeRound([innerHeight, 0]);
    
    // Age group bars
    const ageGroups = g.selectAll('.age-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'age-group')
        .attr('transform', d => `translate(${x0(d.ageGroup)}, 0)`);
    
    // Add the bars for primary
    ageGroups.append('rect')
        .attr('class', 'primary-bar')
        .attr('x', x1('primary'))
        .attr('y', innerHeight) // Start from the bottom
        .attr('width', x1.bandwidth())
        .attr('height', 0) // Initial height is 0 for animation
        .attr('rx', 1) // Slightly rounded corners
        .attr('fill', '#3b82f6') // Blue like in AgeHistogram
        .attr('opacity', 0.8);
    
    // Add the bars for compare
    ageGroups.append('rect')
        .attr('class', 'compare-bar')
        .attr('x', x1('compare'))
        .attr('y', innerHeight) // Start from the bottom
        .attr('width', x1.bandwidth())
        .attr('height', 0) // Initial height is 0 for animation
        .attr('rx', 1) // Slightly rounded corners
        .attr('fill', '#f97316') // Orange like in AgeHistogram
        .attr('opacity', 0.8);
    
    // Simple x-axis labels with minimal space
    g.selectAll('.age-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'age-label')
        .attr('x', d => x0(d.ageGroup) + x0.bandwidth() / 2)
        .attr('y', innerHeight + 10) // Position below x-axis
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', 'currentColor')
        .attr('opacity', 0.7)
        .text(d => d.ageGroup);
    
    // Animate primary bars growing up
    g.selectAll('.primary-bar')
        .data(data)
        .transition()
        .duration(800)
        .delay((_, i) => i * 150)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.primary))
        .attr('height', d => innerHeight - y(d.primary));
    
    // Animate comparison bars growing up after a slight delay
    g.selectAll('.compare-bar')
        .data(data)
        .transition()
        .duration(800)
        .delay((_, i) => 300 + i * 150)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.compare))
        .attr('height', d => innerHeight - y(d.compare));
    
    // Setup automatic re-animation
    animationTimer.value = setTimeout(cycleAnimation, 5000);
    
    // Store current state to track card visibility
    lastCardState.value = true;
}

function cycleAnimation() {
    cleanupChart();
    createChart();
}

// Handle resizing
function handleResize() {
    if (chartContainer.value) {
        createChart();
    }
}

// Clean up resources
function cleanupChart() {
    if (animationTimer.value) {
        clearTimeout(animationTimer.value);
        animationTimer.value = null;
    }
}

// Check visibility to recreate chart when card reopens
const checkVisibility = () => {
    if (!chartContainer.value) return;
    
    const isVisible = chartContainer.value.offsetWidth > 0 && chartContainer.value.offsetHeight > 0;
    
    // If visibility has changed from hidden to visible, recreate the chart
    if (isVisible && lastCardState.value === false) {
        createChart();
    }
    
    lastCardState.value = isVisible;
};

// Set up interval to check visibility changes
let visibilityInterval;

// Lifecycle hooks
onMounted(() => {
    createChart();
    window.addEventListener('resize', handleResize);
    // Check visibility periodically
    visibilityInterval = setInterval(checkVisibility, 500);
    
    // Set up MutationObserver to detect when card becomes visible
    if (chartContainer.value) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                    checkVisibility();
                }
            }
        });
        
        // Observe the container and its ancestors
        let element = chartContainer.value;
        for (let i = 0; i < 3 && element; i++) {
            observer.observe(element, { 
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            element = element.parentElement;
        }
    }
});

onBeforeUnmount(() => {
    cleanupChart();
    window.removeEventListener('resize', handleResize);
    clearInterval(visibilityInterval);
});
</script>