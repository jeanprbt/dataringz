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
        { medal: 'Gold', current: 8, compare: 6 },
        { medal: 'Silver', current: 10, compare: 7 },
        { medal: 'Bronze', current: 7, compare: 9 }
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
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
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
        .domain(data.map(d => d.medal))
        .rangeRound([0, innerWidth])
        .paddingInner(0.3);
    
    const x1 = d3.scaleBand()
        .domain(['current', 'compare'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.current, d.compare)) * 1.1])
        .nice()
        .rangeRound([innerHeight, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(['current', 'compare'])
        .range(['#3b82f6', '#f97316']);
    
    // Medal groups
    const medalGroups = g.selectAll('.medal-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'medal-group')
        .attr('transform', d => `translate(${x0(d.medal)}, 0)`);
    
    // Add the bars for current
    medalGroups.append('rect')
        .attr('class', 'current-bar')
        .attr('x', x1('current'))
        .attr('y', innerHeight) // Start from the bottom
        .attr('width', x1.bandwidth())
        .attr('height', 0) // Initial height is 0 for animation
        .attr('rx', 3) // Rounded corners
        .attr('fill', color('current'));
    
    // Add the bars for compare
    medalGroups.append('rect')
        .attr('class', 'compare-bar')
        .attr('x', x1('compare'))
        .attr('y', innerHeight) // Start from the bottom
        .attr('width', x1.bandwidth())
        .attr('height', 0) // Initial height is 0 for animation
        .attr('rx', 3) // Rounded corners
        .attr('fill', color('compare'));
    
    // Add simple emoji labels for medals instead of axis
    g.selectAll('.medal-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'medal-label')
        .attr('x', d => x0(d.medal) + x0.bandwidth() / 2)
        .attr('y', innerHeight + 20) // Position below where axis would be
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text(d => {
            if (d.medal === 'Gold') return '🥇';
            if (d.medal === 'Silver') return '🥈';
            if (d.medal === 'Bronze') return '🥉';
            return d.medal;
        });
    
    // Animate bars
    g.selectAll('.current-bar')
        .data(data)
        .transition()
        .duration(800)
        .delay((_, i) => i * 150)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.current))
        .attr('height', d => innerHeight - y(d.current));
    
    g.selectAll('.compare-bar')
        .data(data)
        .transition()
        .duration(800)
        .delay((_, i) => 300 + i * 150)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.compare))
        .attr('height', d => innerHeight - y(d.compare));
    
    // No legend for even more minimalist look
    
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