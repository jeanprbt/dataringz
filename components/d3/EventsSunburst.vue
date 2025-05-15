<template>
  <div class="w-full h-full flex items-center justify-center">
    <div ref="sunburstContainer" class="relative flex-1 aspect-square max-h-[calc(100%-3rem)]"></div>
    <div ref="tooltip"
      class="absolute hidden bg-white dark:bg-zinc-800 p-2 rounded shadow-lg border border-gray-200 dark:border-zinc-700 text-sm z-10">
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import sportsData from '~/data/sports.json';

export default {
  name: 'EventsSunburst',
  data() {
    return {
      sunburstData: this.transformSportsData(sportsData),
      tooltipTimer: null,
      tooltipDelay: 500 // ms to delay before showing tooltip
    };
  },
  mounted() {
    this.createSunburstChart();
    // Add resize event listener to make chart responsive
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // Clean up event listener
    window.removeEventListener('resize', this.handleResize);
    // Clear any pending tooltip timers
    if (this.tooltipTimer) clearTimeout(this.tooltipTimer);
  },
  methods: {
    handleResize() {
      // Clear the existing chart and redraw
      if (this.$refs.sunburstContainer) {
        this.$refs.sunburstContainer.innerHTML = '';
        this.createSunburstChart();
      }
    },
    transformSportsData(sportsData) {
      return {
        name: 'Olympic Sports',
        children: Object.values(sportsData).map(sport => {
          const events = Object.keys(sport.events)
          const originalSize = events.length;
          
          // Determine if we need to scale sizes
          const adjustedSize = originalSize < 6 ? 6 / originalSize : 1;

          return {
            name: sport.name,
            children: events.map(event => ({
              name: event,
              size: adjustedSize
            }))
          };
        })
      };
    },

    showTooltip(text, event) {
      // Clear any existing timer
      if (this.tooltipTimer) clearTimeout(this.tooltipTimer);
      
      // Set a new timer to show the tooltip after delay
      this.tooltipTimer = setTimeout(() => {
        const tooltip = this.$refs.tooltip;
        tooltip.innerHTML = text;
        
        tooltip.style.left = `${event.clientX - 100}px`;
        tooltip.style.top = `${event.clientY - 150}px`;
        tooltip.classList.remove('hidden');
      }, this.tooltipDelay);
    },
    hideTooltip() {
      // Clear any existing timer
      if (this.tooltipTimer) {
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = null;
      }
      
      // Hide tooltip immediately
      if (this.$refs.tooltip) {
        this.$refs.tooltip.classList.add('hidden');
      }
    },
    createSunburstChart() {
      // Get container dimensions - accounting for the header and description text above the chart
      const container = this.$refs.sunburstContainer;
      if (!container) return;
      
      // Clear any existing content
      container.innerHTML = '';
      
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
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, this.sunburstData.children.length + 1));

      // Compute the hierarchy
      const hierarchy = d3.hierarchy(this.sunburstData)
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
        .attr("width", size)
        .attr("height", size)
        .attr("viewBox", [-size / 2, -size / 2, size, size])
        .style("font", "10px sans-serif")
        .style("max-width", "100%")
        .style("max-height", "100%")
        .style("margin", "auto")
        .style("display", "block");

      // Add a clickable background for the center area
      const centerClickArea = svg.append("circle")
        .datum(root)
        .attr("r", radius) // Make this large enough to cover the first ring
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .style("cursor", "pointer")
        .on("click", (event) => {
          // Only trigger if click is within the inner circle area
          const [x, y] = d3.pointer(event);
          const distance = Math.sqrt(x * x + y * y);

          // If distance from center is less than the inner radius of the first ring
          if (distance < radius) {
            centerClicked(event);
          }
        });

      // Append arcs
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
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current))
        .style("cursor", "pointer")
        .on("click", (event, d) => clicked(event, d))
        .on("mouseenter", (event, d) => mouseEntered(event, d))
        .on("mouseleave", () => mouseLeft())
        .on("mousemove", (event, d) => {
          // Show tooltip with full name on mousemove
          this.showTooltip(d.data.name, event);
        })
        .on("mouseout", () => {
          // Hide tooltip on mouseout
          this.hideTooltip();
        });

      // Labels - only show for elements with enough space
      const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => {
          // Truncate label if it's too long
          const name = d.data.name;
          if (name.length > 16) {
            return name.substring(0, 14) + "..";
          }
          return name;
        })
        .style("font-size", d => {
          // Scale font size based on depth to ensure readability
          return d.depth === 1 ? "10px" : "9px";
        });

      // Handle mouse enter on segments
      function mouseEntered(event, d) {
        // Skip hover effects during transitions
        if (isTransitioning) return;

        // Only apply hover effects at the sports level and when viewing the root
        if (d.depth === 1 && currentView === root) {
          currentHover = d;

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

      // Handle mouse leave
      function mouseLeft() {
        // Skip if transitioning
        if (isTransitioning) return;

        // Only process if we have an active hover and are at the root view
        if (currentHover && currentView === root) {
          currentHover = null;

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
          zoomToRoot();
        }
      }

      // Function to handle zoom to root (all sports)
      function zoomToRoot() {
        currentView = root;
        currentHover = null;

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

      // Handle click on arc segments
      function clicked(event, p) {
        // Skip if already transitioning
        if (isTransitioning) return;

        // Handle clicking on a sport
        if (p.depth === 1 && p.children) {
          currentView = p;
          currentHover = null;

          // Set transition lock
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

          // Perform the transition
          const t = svg.transition()
            .duration(event.altKey ? 7500 : 750)
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
        } else if (p.depth === 2) {
          // Handle clicking on an event - you could add specific behavior here
          // For now we'll do nothing specific
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
  }
};
</script>
