<template>
  <div class="w-full h-full">
    <div ref="sunburstContainer" class="w-full max-w-2xl mx-auto overflow-hidden"></div>
    <div ref="tooltip" class="absolute hidden bg-white dark:bg-zinc-800 p-2 rounded shadow-lg border border-gray-200 dark:border-zinc-700 text-sm"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import sportsData from '~/data/sports.json';

export default {
  name: 'EventsSunburst',
  data() {
    return {
      sunburstData: this.transformSportsData(sportsData)
    };
  },
  mounted() {
    this.createSunburstChart(this.sunburstData);
  },
  methods: {
    transformSportsData(sportsData) {
      return {
        name: 'Olympic Sports',
        children: Object.values(sportsData).map(sport => ({
            name: sport.name,
            children: sport.events.map(event => ({
            name: event,
            size: 1  // You can adjust the size if necessary
            }))
        }))
        // name: 'Olympic Sports',
        // children: Object.values(sportsData).map(sport => ({
        //      name: sport.name,
        //      children: [
        //      {
        //          name: 'Events',
        //          children: sport.events.map(event => ({
        //          name: event,
        //          size: 1
        //          }))
        //      }
        //      ]
        //  }))
      };
    },
    createSunburstChart(data) {
      // Chart dimensions
      const width = 928;
      const height = width;
      const radius = width / 6;

      // Create color scale
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

      // Compute the hierarchy
      const hierarchy = d3.hierarchy(data)
        .sum(d => d.size)
        .sort((a, b) => b.size - a.size);

      const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

      root.each(d => d.current = d);

      // Arc generator
      const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

      // SVG container
      const svg = d3.select(this.$refs.sunburstContainer)
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif");

      // Append arcs
      const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => { 
          while (d.depth > 1) d = d.parent; 
          return color(d.data.name); 
        })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current))
        .style("cursor", "pointer")
        .on("click", clicked);

      // Title for tooltips
      const format = d3.format(",d");
      path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

      // Labels
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
        .text(d => d.data.name);

      // Parent circle for click-to-zoom
      const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

      // Handle click-to-zoom
      function clicked(event, p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });

        const t = svg.transition().duration(event.altKey ? 7500 : 750);

        path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
          .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
      }

      // Helper functions for visibility and label positioning
      function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
      }

      function labelVisible(d) {
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

<style scoped>
.pop-up {
  background: white;
  padding: 8px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}
</style>
