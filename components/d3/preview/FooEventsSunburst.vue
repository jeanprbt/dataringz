<template>
    <div class="w-full h-full" ref="chartContainer"></div>
</template>

<script setup>
import * as d3 from 'd3';

// Refs for DOM elements
const chartContainer = ref(null);


// State management
const currentHoverIcon = ref(null);
const animationTimer = ref(null);
const lastCardState = ref(null);

const generatePreviewData = () => {
    return {
        name: 'Olympic Sports',
        children: [
            {
                name: 'Athletics',
                icon: '/img/sports/athletics.svg',
                size: 4,
                children: [
                    { name: 'Sprint', size: 1 },
                    { name: 'Jump', size: 1 }
                ]
            },
            {
                name: 'Swimming',
                icon: '/img/sports/swimming.svg',
                size: 3,
                children: [
                    { name: 'Freestyle', size: 1 },
                    { name: 'Relay', size: 1 }
                ]
            },
            {
                name: 'Gymnastics',
                icon: '/img/sports/gymnastics.svg',
                size: 3,
                children: [
                    { name: 'Floor', size: 1 },
                    { name: 'Bars', size: 1 }
                ]
            },
            {
                name: 'Cycling',
                icon: '/img/sports/cycling.svg',
                size: 2,
                children: [
                    { name: 'Road', size: 1 },
                    { name: 'Track', size: 1 }
                ]
            }
        ]
    };
};

// Create and initialize the sunburst chart
function createSunburstChart() {
    if (!chartContainer.value) return;
    
    // Clear any existing content and cancel animations
    cleanupChart();
    d3.select(chartContainer.value).selectAll('svg').remove();
    
    // Get the container dimensions
    const containerWidth = chartContainer.value.clientWidth;
    const containerHeight = chartContainer.value.clientHeight;
    
    // Use the smaller dimension to ensure the chart fits
    const size = Math.min(containerWidth, containerHeight);
    
    // Set a maximum radius for the chart - smaller for a more compact appearance
    const maxRadius = size / 2;
    
    // Calculate radius to ensure good proportions for the 2 levels
    const radius = maxRadius * 0.85;
    
    // Create a nice color scheme for the preview
    const color = d3.scaleOrdinal()
        .range(['#3b82f6', '#ef4444', '#f97316', '#22c55e']);
    
    // Get the data
    const sunburstData = generatePreviewData();
    
    // Compute the hierarchy
    const hierarchy = d3.hierarchy(sunburstData)
        .sum(d => d.size);
    
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);
    
    // Set initial visibility for animation
    root.each(d => {
        d.current = d;
    });
    
    // Arc generator - smaller scale factor for a more compact look
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius)
        .innerRadius(d => Math.max(d.y0 * radius * 0.35, 0))
        .outerRadius(d => Math.max(d.y0 * radius * 0.35, d.y1 * radius * 0.35));
    
    // SVG container
    const svg = d3.select(chartContainer.value)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [-size / 2, -size / 2, size, size])
        .style("max-width", "100%")
        .style("max-height", "100%")
        .style("margin", "auto")
        .style("display", "block");
    
    // Initialize with zero angle for a reveal animation
    const pathGroups = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => {
            // For events, use a lighter version of their parent's color
            if (d.depth > 1) {
                const parentColor = d3.rgb(color(d.parent.data.name));
                return d3.rgb(parentColor).brighter(0.3);
            }
            return color(d.data.name);
        })
        .attr("fill-opacity", 0) // Start with opacity 0
        .attr("d", d => {
            const startAngle = { ...d.current };
            startAngle.x0 = startAngle.x1 = 0; // Start all from angle 0
            startAngle.y0 = d.current.y0;
            startAngle.y1 = d.current.y1;
            return arc(startAngle);
        });
    
    // Animate the arcs in a circular reveal - faster animation for preview
    pathGroups.transition()
        .duration(1000)
        .delay(d => d.depth * 200) // Shorter staggered timing
        .attrTween("d", d => {
            const interpolate = d3.interpolate(
                { x0: 0, x1: 0, y0: d.current.y0, y1: d.current.y1 },
                d.current
            );
            return t => arc(interpolate(t));
        })
        .attr("fill-opacity", d => d.depth === 1 ? 0.75 : 0.6);
    
    // Add hover effects to first level (sports)
    pathGroups.filter(d => d.depth === 1)
        .style("cursor", "pointer")
        .on("mouseenter", function(event, d) {
            // Highlight this sport segment
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill-opacity", 0.9);
            
            // Show its events in the outer ring
            pathGroups.filter(node => node.parent === d)
                .transition()
                .duration(200)
                .attr("fill-opacity", 0.8);
                
            // Dim other segments
            pathGroups.filter(node => node !== d && node.parent !== d)
                .transition()
                .duration(200)
                .attr("fill-opacity", 0.2);
                
            // Show the sport icon
            currentHoverIcon.value = d.data.icon;
        })
        .on("mouseleave", function() {
            // Restore normal state
            pathGroups
                .transition()
                .duration(200)
                .attr("fill-opacity", d => d.depth === 1 ? 0.75 : 0.6);
                
            // Clear the sport icon
            currentHoverIcon.value = null;
        });
        
    // Automatic animation cycle for the preview - shorter timing for compact preview
    let activeIndex = 0;
    const sportNodes = root.descendants().filter(d => d.depth === 1);
    
    function cycleAnimation() {
        const sportNode = sportNodes[activeIndex];
        
        // Trigger mouseenter effect programmatically
        pathGroups.filter(d => d === sportNode)
            .dispatch('mouseenter');
        
        // Schedule mouseleave after a delay
        setTimeout(() => {
            pathGroups.filter(d => d === sportNode)
                .dispatch('mouseleave');
                
            // Move to next sport
            activeIndex = (activeIndex + 1) % sportNodes.length;
            
            // Schedule next cycle - shorter delay for more active preview
            animationTimer.value = setTimeout(cycleAnimation, 800);
        }, 1500);
    }
    
    // Start the animation cycle after initial reveal
    animationTimer.value = setTimeout(cycleAnimation, 2000);
    
    // Store current state to track card visibility
    lastCardState.value = true;
}

// Handle window resizing
function handleResize() {
    if (chartContainer.value) {
        createSunburstChart();
    }
}

// Clean up resources
function cleanupChart() {
    if (animationTimer.value) {
        clearTimeout(animationTimer.value);
        animationTimer.value = null;
    }
}

// Watch for changes in visibility by checking if component's size has changed
const checkVisibility = () => {
    if (!chartContainer.value) return;
    
    const isVisible = chartContainer.value.offsetWidth > 0 && chartContainer.value.offsetHeight > 0;
    
    // If visibility has changed from hidden to visible, recreate the chart
    if (isVisible && lastCardState.value === false) {
        createSunburstChart();
    }
    
    lastCardState.value = isVisible;
};

// Set up interval to check visibility changes (for when cards open/close)
let visibilityInterval;

// Lifecycle hooks
onMounted(() => {
    createSunburstChart();
    window.addEventListener('resize', handleResize);
    // Check visibility periodically to detect when card is shown again
    visibilityInterval = setInterval(checkVisibility, 500);
});

onBeforeUnmount(() => {
    cleanupChart();
    window.removeEventListener('resize', handleResize);
    clearInterval(visibilityInterval);
});

// Force recreate when shown again (for Vue's keep-alive)
onActivated(() => {
    createSunburstChart();
});

// Add a MutationObserver to detect when card is shown again
// This handles the case when the card container becomes visible after being hidden
onMounted(() => {
    if (!chartContainer.value) return;
    
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                checkVisibility();
            }
        }
    });
    
    // Start observing the container and its ancestors (up to 3 levels)
    let element = chartContainer.value;
    for (let i = 0; i < 3 && element; i++) {
        observer.observe(element, { 
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        element = element.parentElement;
    }
});
</script>