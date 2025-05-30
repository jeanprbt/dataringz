<template>
    <div class="w-full h-full flex flex-col items-center">
        <div class="flex flex-wrap gap-2 mb-4 items-center justify-center">
            <UButton variant="soft" @click="startAnimation" :disabled="isAnimating" icon="i-heroicons-play">
                Start
            </UButton>
            <UButton variant="soft" @click="pauseAnimation" :disabled="!isAnimating" icon="i-heroicons-pause">
                Pause
            </UButton>
            <UButton variant="soft" @click="resetAnimation" icon="i-heroicons-arrow-uturn-left">
                Reset
            </UButton>
            <span class="py-1 bg-transparent rounded font-medium text-zinc-600 min-w-[10vw] text-center">
                {{ currentDateFormatted }}
            </span>
            <UCard class="bg-zinc-500/10" :ui="{ body: 'px-2.5 py-1.5 md:px-2.5 md:py-1.5', root: 'ring-0' }">
                <template #default>
                    <div class="flex items-center gap-2 px-2 py-1">
                        <UIcon name="i-heroicons-calendar" class="text-zinc-500" />
                        <p class="text-zinc-500 text-sm font-medium">Progression</p>
                        <USlider v-model="progressionValue" :min="0" :max="100" :default-value="0" size="xs" class="w-32" @update:model-value="handleProgressionChange" />
                    </div>
                </template>
            </UCard>
        </div>
        <div class="w-full min-h-[350px] aspect-[3/2] my-5 overflow-hidden relative flex items-center justify-center" ref="chartContainer"></div>
    </div>
</template>

<script setup>
import * as d3 from 'd3';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    medalData: {
        type: Array,
        required: true
    },
    animationDuration: {
        type: Number,
        default: 300
    },
    animationDelay: {
        type: Number,
        default: 1000
    }
});

// Data refs
const dates = ref([]);
const dailyRankings = ref({});
const currentDateIndex = ref(0);
const isAnimating = ref(false);
const animationTimer = ref(null);
const svg = ref(null);
const xScale = ref(null);
const yScale = ref(null);
const countryColors = ref({});
const currentDate = ref(null);
const progressionValue = ref(0);
const countries = ref({});
const width = ref(0);
const height = ref(0);
const margin = ref({ top: 50, right: 180, bottom: 50, left: 80 });
const pathGenerator = ref(null);
const allCountryCodes = ref(new Set());
const chartContainer = ref(null);
const tooltip = ref(null);
const resizeTimer = ref(null);

// Computed properties
const currentDateFormatted = computed(() => {
    if (!currentDate.value) return '';
    const date = new Date(currentDate.value);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const effectiveAnimationDelay = computed(() => {
    return props.animationDelay;
});

// Methods
const handleProgressionChange = (value) => {
    // Calculate the date index based on the slider position
    const newIndex = Math.floor((value / 100) * (dates.value.length - 1));
    
    // Update date and animation state
    currentDateIndex.value = newIndex;
    currentDate.value = dates.value[newIndex];
    
    // Update chart without animation when sliding
    updateChart(true);
};

const processData = () => {
    dailyRankings.value = createCumulativeMedalRankings(props.medalData);
    dates.value = Object.keys(dailyRankings.value).sort();

    if (dates.value.length > 0) {
        currentDate.value = dates.value[0];
    }

    // Create a map of country codes to their flag URLs
    countries.value = {};
    props.medalData.forEach(medal => {
        if (!countries.value[medal.country_code.toLowerCase()]) {
            countries.value[medal.country_code.toLowerCase()] = {
                img: medal.img
            };
        }
    });

    // Collect all country codes
    dates.value.forEach(date => {
        dailyRankings.value[date].forEach(entry => {
            allCountryCodes.value.add(entry.countryCode);
        });
    });

    // Generate consistent colors for each country
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    Array.from(allCountryCodes.value).forEach((countryCode, i) => {
        countryColors.value[countryCode] = colorScale(i);
    });

    currentDateIndex.value = dates.value.indexOf(currentDate.value);
};

const createCumulativeMedalRankings = (medalData) => {
    // Sort medals chronologically
    const sortedMedals = [...medalData].sort((a, b) => a.medal_date.localeCompare(b.medal_date));

    const dailyRankings = {};
    const countryTotals = {};

    let currentDay = null;
    let medalsToday = [];

    for (let i = 0; i <= sortedMedals.length; i++) {
        const medal = sortedMedals[i];
        const date = medal?.medal_date;

        // New day or end of data — process yesterday's medals
        if (currentDay && (date !== currentDay || i === sortedMedals.length)) {
            // Add all medals from that day to cumulative totals
            for (const m of medalsToday) {
                const medalCode = Number(m.medal_code);
                const country = m.country_code;

                if (!countryTotals[country]) {
                    countryTotals[country] = {
                        gold: 0,
                        silver: 0,
                        bronze: 0,
                        total: 0,
                        country: m.country,
                        countryCode: country
                    };
                }

                if (medalCode === 1) countryTotals[country].gold++;
                else if (medalCode === 2) countryTotals[country].silver++;
                else if (medalCode === 3) countryTotals[country].bronze++;

                countryTotals[country].total++;
            }

            // Take a snapshot
            const snapshot = Object.values(countryTotals).map(entry => ({ ...entry }));

            // Sort by medal count and then alphabetically for ties
            snapshot.sort((a, b) => {
                // Primary sort by gold medals
                if (a.gold !== b.gold) return b.gold - a.gold;

                // Secondary sort by silver medals
                if (a.silver !== b.silver) return b.silver - a.silver;

                // Tertiary sort by bronze medals
                if (a.bronze !== b.bronze) return b.bronze - a.bronze;

                // If all medal counts are the same, sort alphabetically by country name
                return a.country.localeCompare(b.country);
            });

            // Assign ranks with max visible rank of 20, others get 20.5
            for (let j = 0; j < snapshot.length; j++) {
                const rank = j + 1;
                snapshot[j].rank = rank <= 20 ? rank : 20.5;
            }

            dailyRankings[currentDay] = snapshot;
        }

        // Update for next day
        if (date !== currentDay) {
            currentDay = date;
            medalsToday = [];
        }

        if (medal) {
            medalsToday.push(medal);
        }
    }
    return dailyRankings;
};

const buildCountryRankHistory = (dailyRankings) => {
    const countryHistory = {};

    for (const [date, rankings] of Object.entries(dailyRankings)) {
        for (const entry of rankings) {
            const code = entry.countryCode;
            if (!countryHistory[code]) {
                countryHistory[code] = [];
            }
            countryHistory[code].push({
                date: date,
                rank: entry.rank,
                country: entry.country,
                countryCode: code,
            });
        }
    }

    // Trie les dates pour chaque pays (au cas où)
    for (const history of Object.values(countryHistory)) {
        history.sort((a, b) => a.date.localeCompare(b.date));
    }

    return countryHistory;
};

const handleResize = () => {
    clearTimeout(resizeTimer.value);
    resizeTimer.value = setTimeout(() => {
        if (svg.value) {
            const wasAnimating = isAnimating.value;
            if (wasAnimating) pauseAnimation();

            svg.value.remove();
            initializeChart();

            if (wasAnimating) startAnimation();
        }
    }, 250);
};

const getCountryFlag = (countryCode) => {
    if (!countries.value || !countryCode) return null;
    const lowerCode = countryCode.toLowerCase();
    return props.medalData.find(m => m.country_code.toLowerCase() === lowerCode)?.img || null;
};

const initializeChart = () => {
    if (!chartContainer.value) return;

    width.value = chartContainer.value.clientWidth || 800;
    height.value = chartContainer.value.clientHeight || 600;

    // Create SVG element
    svg.value = d3.select(chartContainer.value)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height.value)
        .attr('viewBox', `0 0 ${width.value} ${height.value}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define scales
    xScale.value = d3.scalePoint()
        .domain(dates.value)
        .range([margin.value.left, width.value - margin.value.right])
        .padding(0.25);

    yScale.value = d3.scaleLinear()
        .domain([20.5, 0.5])
        .range([height.value - margin.value.bottom, margin.value.top])

    // Add axes
    const xAxis = d3.axisBottom(xScale.value)
        .tickFormat(() => '') // Empty string for tick labels
        .tickSize(0);         // No tick marks

    const yAxis = d3.axisLeft(yScale.value)
        .tickValues([...d3.range(1, 21), 20]);

    svg.value.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height.value - margin.value.bottom})`)
        .call(xAxis);

    svg.value.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.value.left},0)`)
        .call(yAxis);

    // Create groups for drawing elements
    svg.value.append('g').attr('class', 'lines-group');
    svg.value.append('g').attr('class', 'labels-group');
    svg.value.append('g').attr('class', 'date-indicator');

    // Path generator for the lines
    pathGenerator.value = d3.line()
        .x(d => xScale.value(d.date))
        .y(d => yScale.value(d.rank))
        .curve(d3.curveMonotoneX);

    tooltip.value = d3.select(chartContainer.value)
        .append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('background', 'rgba(0,0,0,0.7)')
        .style('color', 'white')
        .style('padding', '5px 8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('opacity', 0)
        .style('transition', 'opacity 0.3s');

    // Initialize with first date
    updateChart(true);
};

const updateChart = (immediate = false) => {
    if (!dailyRankings.value || !currentDate.value || !svg.value) {
        console.error("Data or SVG not ready");
        return;
    }

    const duration = immediate ? 0 : props.animationDuration;

    // Get all dates up to current date
    const currentDateIdx = dates.value.indexOf(currentDate.value);
    const relevantDates = dates.value.slice(0, currentDateIdx + 1);

    // Get top 20 countries for current date
    const topCountries = dailyRankings.value[currentDate.value]
        .map(c => c.countryCode);

    // Prepare the line data - one complete path per country
    const lineData = [];

    // Process all countries that have ever been in top 20
    Array.from(allCountryCodes.value).forEach(countryCode => {
        const countryPath = {
            countryCode: countryCode,
            country: '',
            points: []
        };

        // For each date, find this country's position
        let hasAppeared = false;
        relevantDates.forEach(date => {
            const dateData = dailyRankings.value[date];
            const countryData = dateData.find(d => d.countryCode === countryCode);

            if (countryData) {
                countryPath.country = countryData.country;

                // If country is in the data for this date
                countryPath.points.push({
                    date,
                    rank: countryData.rank,
                    total: countryData.total
                });

                if (countryData.rank <= 20) hasAppeared = true;
            } else {
                // Country has no data for this date, place it off-chart
                countryPath.points.push({
                    date,
                    rank: 20.5, // Off chart
                    total: 0
                });
            }
        });

        // Only add countries that have appeared in top 20 at some point
        if (hasAppeared) {
            lineData.push(countryPath);
        }
    });

    // Update the lines
    const linesGroup = svg.value.select('.lines-group');

    // Filter out countries that should not be shown in the timeline yet
    // Only keep countries that have appeared in the top 20 by the current date
    const filteredLineData = lineData.filter(country => {
        // Check if the country has ever appeared in top 20 by the current date
        const countryEverInTop = country.points.some((point, idx) => {
            const pointDate = country.points[idx].date;
            // Only check points up to current date
            return pointDate <= currentDate.value && point.rank <= 20;
        });
        return countryEverInTop;
    });

    const lines = linesGroup.selectAll('.country-line')
        .data(filteredLineData, d => d.countryCode);
    
    // Remove lines for countries that haven't appeared yet when going backwards
    lines.exit()
        .transition()
        .duration(duration)
        .attr('opacity', 0)
        .remove();

    // Enter: Add new lines
    const enterLines = lines.enter()
        .append('path')
        .attr('class', 'country-line')
        .attr('id', d => `line-${d.countryCode}`)
        .attr('stroke', d => countryColors.value[d.countryCode])
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('opacity', 0.7)
        .on('mouseover', (event, d) => {
            d3.selectAll('.country-line').attr('opacity', 0.1);
            d3.select(event.currentTarget).attr('opacity', 1).attr('stroke-width', 5);

            // Show tooltip
            tooltip.value
                .style('opacity', 1)
                .html(d.country)
                .style('left', (event.pageX - 300) + 'px')
                .style('top', (event.pageY - 300) + 'px');
        })
        .on('mousemove', (event) => {
            // Move tooltip with cursor
            tooltip.value
                .style('left', (event.pageX - 150) + 'px')
                .style('top', (event.pageY - 200) + 'px');
        })
        .on('mouseout', (event, d) => {
            d3.selectAll('.country-line').attr('opacity', 0.7).attr('stroke-width', 3);
            // Hide tooltip
            tooltip.value.style('opacity', 0);
        });

    // Update existing lines
    lines.merge(enterLines)
        .transition()
        .duration(duration)
        .attr('d', d => pathGenerator.value(d.points))
        .attr('opacity', d => {
            // Only show if in top 20 at current date
            const isInTop = topCountries.includes(d.countryCode);
            return isInTop ? 0.7 : 0;
        })
        .attr('stroke-width', d => {
            const isInTop = topCountries.includes(d.countryCode);
            return isInTop ? 3 : 3;
        });

    // Update country labels (at the end of lines)
    const labelsData = [];
    topCountries.forEach(countryCode => {
        const countryData = dailyRankings.value[currentDate.value]
            .find(d => d.countryCode === countryCode);

        if (countryData && countryData.rank <= 20) {
            labelsData.push({
                countryCode: countryCode,
                country: countryData.country,
                rank: countryData.rank,
                total: countryData.total,
                x: xScale.value(currentDate.value),
                y: yScale.value(countryData.rank),
                flagUrl: getCountryFlag(countryCode)
            });
        }
    });

    const labelsGroup = svg.value.select('.labels-group');
    const labels = labelsGroup.selectAll('.country-label')
        .data(labelsData, d => d.countryCode);

    // Remove labels that are no longer in top 20
    labels.exit()
        .transition()
        .duration(duration)
        .attr('opacity', 0)
        .remove();

    // Add new labels
    const enterLabels = labels.enter()
        .append('g')
        .attr('class', 'country-label')
        .attr('id', d => `label-${d.countryCode}`)
        .attr('opacity', 0)
        .attr('transform', d => `translate(${d.x + 10}, ${d.y})`);

    // Add flag image to new labels with error handling
    enterLabels.append('svg:image')
        .attr('class', 'country-flag')
        .attr('width', 20)
        .attr('height', 15)
        .attr('y', -7.5)
        .attr('x', 0)
        .attr('href', d => {
            const flagUrl = getCountryFlag(d.countryCode);
            return flagUrl;
        })
        .on('error', function (event, d) {
            console.error('Flag loading error for:', d.country);
            d3.select(this).style('display', 'none');
        });

    // Add country name text to new labels (adjusted x position)
    enterLabels.append('text')
        .attr('class', 'country-name')
        .attr('x', 25) // Position text after flag
        .attr('y', 4)
        .attr('fill', d => countryColors.value[d.countryCode])
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d => `${d.country} (${d.total})`);

    // Update all labels
    labels.merge(enterLabels)
        .transition()
        .duration(duration)
        .attr('transform', d => `translate(${d.x + 10}, ${d.y})`)
        .attr('opacity', 1);

    // Update existing labels' text content
    labels.select('.country-name')
        .text(d => `${d.country} (${d.total})`);

    // Update date indicator
    const dateIndicator = svg.value.select('.date-indicator');

    // Add line if it doesn't exist
    if (dateIndicator.select('line').empty()) {
        dateIndicator.append('line')
            .attr('stroke', 'gray')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '2')
            .attr('y1', margin.value.top)
            .attr('y2', height.value - margin.value.bottom);

        dateIndicator.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', margin.value.top - 10)
            .style('fill', 'gray')
            .style('font-weight', 'bold');
    }

    // Update indicator position
    dateIndicator
        .transition()
        .duration(duration)
        .attr('transform', `translate(${xScale.value(currentDate.value)}, 0)`);

    dateIndicator.select('text')
        .text(new Date(currentDate.value).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        }));
};

const startAnimation = () => {
    if (isAnimating.value) return;

    isAnimating.value = true;
    animateNextFrame();
};

const animateNextFrame = () => {
    if (!isAnimating.value) return;

    if (currentDateIndex.value < dates.value.length - 1) {
        currentDateIndex.value++;
        currentDate.value = dates.value[currentDateIndex.value];
        
        // Update progression slider value to match current position
        progressionValue.value = (currentDateIndex.value / (dates.value.length - 1)) * 100;
        
        updateChart();

        animationTimer.value = setTimeout(() => {
            // Only proceed if still animating
            if (isAnimating.value) {
                animateNextFrame();
            }
        }, effectiveAnimationDelay.value);
    } else {
        isAnimating.value = false;
    }
};

const pauseAnimation = () => {
    isAnimating.value = false;
    clearAnimation();
};

const resetAnimation = () => {
    clearAnimation();
    currentDateIndex.value = 0;
    currentDate.value = dates.value[0];
    progressionValue.value = 0;
    isAnimating.value = false;
    updateChart(true);
    // Clear old lines
    svg.value.selectAll('.country-line').remove();
    svg.value.selectAll('.country-label').remove();
};

const clearAnimation = () => {
    if (animationTimer.value) {
        clearTimeout(animationTimer.value);
        animationTimer.value = null;
    }
};

// Lifecycle hooks
onMounted(() => {
    processData();
    initializeChart();
    window.addEventListener('resize', handleResize);
    setTimeout(() => {
        startAnimation();
    }, 500);
});

onBeforeUnmount(() => {
    clearAnimation();
    window.removeEventListener('resize', handleResize);
});

// Optional: Watch for changes in relevant data
watch(() => props.medalData, () => {
    processData();
    if (svg.value) {
        svg.value.remove();
        initializeChart();
    }
}, { deep: true });
</script>
