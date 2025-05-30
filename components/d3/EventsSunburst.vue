<template>
    <div class="w-[100vw] sm:w-[40vw] h-full flex items-center justify-center">
        <div ref="sunburstContainer" class="relative aspect-square w-[min(100vw,100vh)] h-[min(100vw,100vh)] sm:w-[min(40vw,100vh)] sm:h-[min(40vw,100vh)] max-w-full max-h-full">
            <div ref="centerIcon"
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-50 w-20 h-20">
                <UButton v-if="isDetailView" @click="zoomToRoot" icon="i-heroicons-arrow-uturn-left" variant="soft"
                    class="rounded-full" size="xl" color="gray" />
                <div v-else-if="currentHoverIcon" class="w-full h-full p-2 flex items-center justify-center">
                    <img :src="currentHoverIcon" class="w-16 h-16 object-contain transition-opacity duration-200 dark:invert"
                        alt="Sport icon" />
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';
import sports from '~/data/sports.json';
import events from '~/data/events.json';
import { useRouter } from 'vue-router';

// Refs for DOM elements
const sunburstContainer = ref(null);
const centerIcon = ref(null);

// Router for navigation
const router = useRouter();

// Reactive state
const currentHoverIcon = ref(null);
const isDetailView = ref(false);
const rootZoomFunction = ref(null);

// Transform sports data to the format needed for D3
function transformSportsData(sports) {
    // Set a minimum size for sports to ensure good visibility
    const minSportSize = 5; // Minimum size to ensure readability
    
    return {
        name: 'Olympic Sports',
        children: Object.values(sports).map(sport => {
            const sportEvents = [];
            for (const eventSlug of sport.events) {
                const event = events[eventSlug];
                sportEvents.push({
                    ...event,
                    slug: eventSlug // Preserve the slug for navigation
                });
            }
            
            // Apply minimum size for sports with few events
            let effectiveSize;
            if (sport.events.length < 3) {
                // Boost small sports significantly
                effectiveSize = minSportSize;
            } else if (sport.events.length < 6) {
                // Boost medium-sized sports moderately
                effectiveSize = Math.max(sport.events.length, 3);
            } else {
                // Keep large sports as is
                effectiveSize = sport.events.length;
            }
            
            return {
                name: sport.name,
                icon: sport.icon,
                size: effectiveSize, // Set size at the sport level for minimum angle
                children: sportEvents.map(event => ({
                    name: event.name,
                    slug: event.slug, // Preserve the slug for navigation
                    size: 1 // Each event has equal weight within its sport
                }))
            };
        })
    };
}

const sunburstData = transformSportsData(sports);

// Method to handle zooming back to root view
function zoomToRoot() {
    if (rootZoomFunction.value) {
        rootZoomFunction.value();
    }
}

// Handle window resizing
function handleResize() {
    // Clear the existing chart and redraw
    if (sunburstContainer.value) {
        // Preserve the center icon and its container
        const centerIconEl = centerIcon.value;
        sunburstContainer.value.innerHTML = '';
        // Reattach the center icon
        if (centerIconEl) {
            sunburstContainer.value.appendChild(centerIconEl);
        }
        createSunburstChart();
    }
}

// D3 chart creation function
function createSunburstChart() {
    // Get container dimensions - accounting for the header and description text above the chart
    const container = sunburstContainer.value;
    if (!container) return;

    // Clear any existing content except the center icon
    // Preserve SVG and center icon container
    const centerIconEl = centerIcon.value;
    // Remove only the SVG if it exists
    container.querySelectorAll('svg').forEach(svg => svg.remove());

    // Size the center icon container
    const centerIconSize = 80; // pixels - adjust as needed
    centerIconEl.style.width = `${centerIconSize}px`;
    centerIconEl.style.height = `${centerIconSize}px`;

    // Get the available dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Use the smaller dimension to ensure the chart fits
    const size = Math.min(containerWidth, containerHeight);

    // Set a maximum radius to ensure the chart fits entirely within the container
    const maxRadius = size / 2;

    // Calculate radius to ensure good proportions for the 3 levels in our hierarchy
    const radius = maxRadius / 3;

    // Create color scale
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, sunburstData.children.length + 1));

    // Compute the hierarchy
    const hierarchy = d3.hierarchy(sunburstData)
        .sum(d => d.size);

    // Don't sort - maintain original order from data

    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    // Set initial visibility - hide everything except the first level
    root.each(d => {
        // Initially, show only the first level (sports)
        if (d.depth <= 1) {
            d.current = d;
        } else {
            // For deeper levels (events), hide them initially
            d.current = {
                x0: d.parent.x0,
                x1: d.parent.x0,
                y0: d.parent.y0,
                y1: d.parent.y1
            };
        }
    });

    // Track current view state
    let currentView = root;
    // Track current hover state
    let currentHover = null;
    // Add a transition lock to prevent interruptions
    let isTransitioning = false;

    // Arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.25)
        .innerRadius(d => Math.max(d.y0 * radius, 0))
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // SVG container - make it responsive
    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [-size / 2, -size / 2, size, size])
        .style("font", "10px sans-serif")
        .style("max-width", "100%")
        .style("max-height", "100%")
        .style("margin", "auto")
        .style("display", "block");

    // Append arcs with initial state for animation
    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => {
            // For events, use a lighter version of their parent's color
            if (d.depth > 1) {
                // Get parent color and make it lighter
                const parentColor = d3.rgb(color(d.parent.data.name));
                // Increase lightness for child elements (events)
                return d3.rgb(parentColor).brighter(0.2);
            }
            // For sports, use the original color
            return color(d.data.name);
        })
        .attr("fill-opacity", 0) // Start with opacity 0 for reveal animation
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        // Initialize with zero angle for circular reveal animation
        .attr("d", d => {
            const initialD = {...d.current};
            initialD.x0 = initialD.x1 = 0; // Start all arcs from angle 0
            return arc(initialD);
        })
        .style("cursor", "pointer")
        .on("click", (event, d) => clicked(event, d))
        .on("mouseenter", (event, d) => mouseEntered(event, d))
        .on("mouseleave", () => mouseLeft())
        
    // Animate the arcs in a circular pie-chart-like reveal
    path.transition()
        .duration(1500)
        .delay(d => d.depth * 150) // Stagger by depth
        .attrTween("d", d => {
            const interpolate = d3.interpolate(
                { x0: 0, x1: 0, y0: d.current.y0, y1: d.current.y1 },
                d.current
            );
            return t => arc(interpolate(t));
        })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0);

    // Labels - only show for elements with enough space
    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", 0) // Start with invisible labels
        .attr("transform", d => labelTransform(d.current))
        .text(d => {
            // Truncate label if it's too long
            const name = d.data.name;
            if (name.length > 10) {
                return name.substring(0, 10) + "..";
            }
            return name;
        })
        .style("font-size", d => {
            // Scale font size based on depth to ensure readability
            return d.depth === 1 ? "10px" : "9px";
        });
        
    // Animate labels appearance at the same time as their arcs
    label.transition()
        .duration(1500)
        .delay(d => d.depth * 150) // Same delay as the corresponding arcs
        .attr("fill-opacity", d => +labelVisible(d.current));

    // Handle mouse enter on segments
    function mouseEntered(event, d) {
        if (isTransitioning) return;

        if (d.depth === 1 && currentView === root) {
            currentHover = d;
            currentHoverIcon.value = d.data.icon;

            // Only apply hover effects at the sports level and when viewing the root
            if (d.depth === 1 && currentView === root) {
                currentHover = d;

                // Show the sport icon when hovering over a sport
                if (d.data.icon) {
                    currentHoverIcon.value = d.data.icon;
                }

                // Update opacity to highlight the hovered sport and show its events
                path
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", node => {
                        if (node === d) {
                            // Highlight the hovered sport
                            return 0.85;
                        } else if (node.parent === d && node.depth === 2) {
                            // Show events of the hovered sport in the outer ring only
                            return 0.6;  // Slightly dimmer than the sport
                        } else if (node.depth === 1) {
                            // Fade other sports
                            return 0.3;
                        } else {
                            // Hide events of other sports
                            return 0;
                        }
                    })
                    .attr("d", node => {
                        if (node.parent === d && node.depth === 2) {
                            // Position events of the hovered sport in the outer ring only
                            // Use Array.from to ensure proper indexing
                            const index = Array.from(d.children).indexOf(node);
                            const count = d.children.length;
                            const arcSize = 2 * Math.PI / count;

                            // Create temporary target for event positioning - distribute in 360° outer ring
                            node.hoverTarget = {
                                x0: index * arcSize,
                                x1: (index + 1) * arcSize,
                                y0: 2,  // Start of outer ring
                                y1: 3   // End of outer ring
                            };

                            return arc(node.hoverTarget);
                        } else {
                            // Keep everyone else at their current position
                            return arc(node.current);
                        }
                    });

                // Update labels for events of hovered sport
                label
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", node => {
                        if (node === d) {
                            return 1; // Show label for hovered sport
                        } else if (node.parent === d && node.depth === 2) {
                            return 0.9; // Show labels for events of hovered sport
                        } else if (node.depth === 1) {
                            return 0.2; // Fade labels of other sports
                        } else {
                            return 0; // Hide labels for events of other sports
                        }
                    })
                    .attr("transform", node => {
                        if (node.parent === d && node.depth === 2) {
                            // Position event labels in outer ring
                            if (node.hoverTarget) {
                                const x = (node.hoverTarget.x0 + node.hoverTarget.x1) / 2 * 180 / Math.PI;
                                const y = (node.hoverTarget.y0 + node.hoverTarget.y1) / 2 * radius;
                                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
                            }
                        }
                        return labelTransform(node.current);
                    });
            }
        }
    }

    // Handle mouse leave
    function mouseLeft() {
        // Skip if transitioning
        if (isTransitioning) return;

        // Only process if we have an active hover and are at the root view
        if (currentHover && currentView === root) {
            currentHover = null;

            // Clear the sport icon when no longer hovering
            currentHoverIcon.value = null;

            // Restore original opacities and positions
            path
                .transition()
                .duration(200)
                .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("d", d => arc(d.current));

            // Restore original label opacities and positions
            label
                .transition()
                .duration(200)
                .attr("fill-opacity", d => +labelVisible(d.current))
                .attr("transform", d => labelTransform(d.current));
        }
    }

    // Handle center click to return to initial view
    function centerClicked(event) {
        // Only do something if we're not already at the root view
        if (currentView !== root && !isTransitioning) {
            zoomToRootImpl();
        }
    }

    // Function to handle zoom to root (all sports)
    function zoomToRootImpl() {
        currentView = root;
        currentHover = null;

        // Hide back button, clear sport icon
        isDetailView.value = false;
        currentHoverIcon.value = null;

        // Set transition lock
        isTransitioning = true;

        // Reset all nodes to their original positions
        root.each(d => {
            if (d.depth <= 1) {
                // Sports appear as they are in the hierarchy
                d.target = {
                    x0: d.x0,
                    x1: d.x1,
                    y0: d.y0,
                    y1: d.y1
                };
            } else {
                // Events are hidden
                d.target = {
                    x0: d.parent.x0,
                    x1: d.parent.x0, // Same as x0 to make it invisible
                    y0: d.parent.y0,
                    y1: d.parent.y1
                };
            }
        });

        // Perform the transition
        const t = svg.transition()
            .duration(750)
            .on("end", () => {
                // Release the transition lock when animation completes
                isTransitioning = false;
            });

        path.transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
            })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
            .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
    }

    // Expose the zoomToRoot function to the Vue component
    rootZoomFunction.value = zoomToRootImpl;

    // Handle click on arc segments
    function clicked(event, p) {
        if (isTransitioning) return;

        if (p.depth === 1 && p.children) {
            currentView = p;
            currentHover = null;
            currentHoverIcon.value = null;

            isTransitioning = true;

            // Calculate targets for full 360 view of the selected sport
            root.each(d => {
                if (d === p) {
                    // The clicked sport expands to take up the full inner circle
                    d.target = {
                        x0: 0,
                        x1: 2 * Math.PI,
                        y0: 1,
                        y1: 2
                    };
                } else if (d.parent === p) {
                    // The events of the clicked sport are distributed around the outer circle
                    const index = Array.from(p.children).indexOf(d);
                    const count = p.children.length;

                    // Distribute events evenly around the outer circle
                    const arcSize = 2 * Math.PI / count;
                    d.target = {
                        x0: index * arcSize,
                        x1: (index + 1) * arcSize,
                        y0: 2,
                        y1: 3
                    };
                } else {
                    // Hide other sports and their events
                    d.target = {
                        x0: 0,
                        x1: 0,
                        y0: 0,
                        y1: 0
                    };
                }
            });

            const t = svg.transition()
                .duration(event.altKey ? 7500 : 750)
                .on("end", () => {
                    // Set isDetailView after transition completes
                    isDetailView.value = true;
                    isTransitioning = false;
                });

            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
                .attrTween("d", d => () => arc(d.current));

            label.filter(function (d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        } else if (p.depth === 2) {
            // Handle clicking on an event - navigate to the event page
            if (p.data.slug) {
                router.push(`/event/${p.data.slug}`);
            }
        }
    }

    // Helper functions for visibility and label positioning
    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        // Adjusted the threshold for better label visibility in the outer ring
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
}

// Lifecycle hooks
onMounted(() => {
    createSunburstChart();
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});
</script>
