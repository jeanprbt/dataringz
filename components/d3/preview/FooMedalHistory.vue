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
        { year: 2000, city: 'Sydney', total: 15, gold: 5, silver: 4, bronze: 6, rank: 7 },
        { year: 2004, city: 'Athens', total: 18, gold: 7, silver: 5, bronze: 6, rank: 6 },
        { year: 2008, city: 'Beijing', total: 16, gold: 6, silver: 4, bronze: 6, rank: 8 },
        { year: 2012, city: 'London', total: 20, gold: 8, silver: 6, bronze: 6, rank: 5 },
        { year: 2016, city: 'Rio', total: 22, gold: 9, silver: 7, bronze: 6, rank: 4 },
        { year: 2020, city: 'Tokyo', total: 25, gold: 10, silver: 8, bronze: 7, rank: 3 }
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
    
    // Set up margins - very minimal for preview
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
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
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total) * 1.1])
        .range([innerHeight, 0]);
    
    const rankScale = d3.scaleLinear()
        .domain([1, d3.max(data, d => d.rank) + 1])
        .range([0, innerHeight * 0.6]);
    
    // Line generators
    const totalLine = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.total))
        .curve(d3.curveMonotoneX);
    
    const rankLine = d3.line()
        .x(d => x(d.year))
        .y(d => rankScale(d.rank))
        .curve(d3.curveMonotoneX);
    
    // Create gradient for the medal areas
    const medalGradient = svg.append('linearGradient')
        .attr('id', 'medalGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', y(0))
        .attr('x2', 0)
        .attr('y2', y(d3.max(data, d => d.total) * 0.8));
    
    medalGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f97316')
        .attr('stop-opacity', 0.3);
    
    medalGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.7);
    
    // Create medal area
    const medalArea = d3.area()
        .x(d => x(d.year))
        .y0(innerHeight)
        .y1(d => y(d.total))
        .curve(d3.curveMonotoneX);
    
    // Add the medal area first (below the lines)
    svg.append('path')
        .datum(data)
        .attr('fill', 'url(#medalGradient)')
        .attr('opacity', 0) // Start invisible for animation
        .attr('d', medalArea)
        .transition()
        .duration(1000)
        .delay(500)
        .attr('opacity', 1);
    
    // Add the total medals line
    const totalPath = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6') // Blue
        .attr('stroke-width', 2)
        .attr('d', totalLine);
    
    // Add rank line
    const rankPath = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#f97316') // Orange
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
        .attr('d', rankLine);
    
    // Animate path with stroke dasharray technique
    const animatePath = (path, duration) => {
        const totalLength = path.node().getTotalLength();
        
        path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
    };
    
    // Animate both paths
    animatePath(totalPath, 1500);
    animatePath(rankPath, 1500);
    
    // Add minimal dots for medals
    svg.selectAll('.medal-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'medal-dot')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.total))
        .attr('r', 0) // Start with radius 0
        .attr('fill', '#3b82f6')
        .transition()
        .duration(400)
        .delay((d, i) => 1500 + i * 100)
        .attr('r', 3);
    
    // Add minimal dots for rank
    svg.selectAll('.rank-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'rank-dot')
        .attr('cx', d => x(d.year))
        .attr('cy', d => rankScale(d.rank))
        .attr('r', 0) // Start with radius 0
        .attr('fill', '#f97316')
        .transition()
        .duration(400)
        .delay((d, i) => 1500 + i * 100)
        .attr('r', 2);
    
    // Add subtle pulse animation to the dots
    function pulseDots() {
        svg.selectAll('.medal-dot')
            .transition()
            .duration(1000)
            .attr('r', 4)
            .transition()
            .duration(1000)
            .attr('r', 3)
            .on('end', pulseDots);
    }
    
    // Start the pulse animation after initial appearance
    animationTimer.value = setTimeout(pulseDots, 2000);
    
    // Store current state to track card visibility
    lastCardState.value = true;
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