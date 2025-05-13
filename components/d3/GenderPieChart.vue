<template>
    <div ref="chartContainer" class="w-full max-w-xs mx-auto my-4"></div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import * as d3 from 'd3';
  import athletes from '~/data/athletes.json';
  
  const props = defineProps({
    sportSlug: {
      type: String,
      required: true
    }
  });
  
  const chartContainer = ref(null);
  
  const createPieChart = () => {
    d3.select(chartContainer.value).selectAll('*').remove();
  
    const sportAthletes = Object.values(athletes).filter((athlete: any) =>
      athlete.sports?.some((s: any) => s.slug === props.sportSlug)
    );
  
    const genderCounts: Record<string, number> = sportAthletes.reduce((acc: Record<string, number>, athlete: any) => {
      acc[athlete.gender] = (acc[athlete.gender] || 0) + 1;
      return acc;
    }, {});
  
    const total = Object.values(genderCounts).reduce((sum: number, c: any) => sum + c, 0);
  
    const data = Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: (count / total) * 100
    }));
  
    const width = 240;
    const height = 240;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;
  
    const color = d3.scaleOrdinal<string>()
      .domain(['Male', 'Female'])
      .range(['#3b82f6', '#ec4899']);
  
    const svg = d3.select(chartContainer.value)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height + 40}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
    const pie = d3.pie<any>()
      .value(d => d.count)
      .sort(null);
  
    const arc = d3.arc()
      .innerRadius(40)
      .outerRadius(radius);
  
    const arcHover = d3.arc()
      .innerRadius(35)
      .outerRadius(radius + 5);
  
    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d: any) => color(d.data.gender))
      .attr('stroke', 'white')
      .style('stroke-width', '3px')
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).transition().duration(200).attr('d', arcHover as any);
        legendGroup.transition().style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('d', arc as any);
        legendGroup.transition().style('opacity', 0);
      });
  
    // Add percentage labels inside the pie slices
    const labelArc = d3.arc()
      .innerRadius(radius * 0.66)
      .outerRadius(radius * 0.66);
  
    svg.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text((d: any) => `${d.data.count}`);

  
    // Legend group (initially hidden)
    const legendGroup = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${radius + 20})`)
      .style('opacity', 0);
  
    const legendSpacing = 18;
    const legend = legendGroup.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_d, i) => `translate(${-40}, ${i * legendSpacing})`);
  
    legend.append('rect')
      .attr('x', 0)
      .attr('y', -7)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d.gender));
  
    legend.append('text')
      .attr('x', 18)
      .attr('y', 0)
      .style('fill', '#555')
      .style('font-size', '13px')
      .style('alignment-baseline', 'middle')
      .text(d => `${d.gender}: ${d.percentage.toFixed(1)}%`);

  };
  
  watch(() => props.sportSlug, createPieChart);
  onMounted(createPieChart);
  </script>

  