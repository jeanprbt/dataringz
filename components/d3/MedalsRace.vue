<template>
    <div class="w-full h-full flex flex-col items-center">
        <div class="flex flex-wrap gap-2 mb-4 items-center justify-center">
            <UButton variant="soft" @click="startAnimation" :disabled="isAnimating" icon="i-heroicons-play">Start
            </UButton>
            <UButton variant="soft" @click="pauseAnimation" :disabled="!isAnimating" icon="i-heroicons-pause">Pause
            </UButton>
            <UButton variant="soft" @click="resetAnimation" icon="i-heroicons-arrow-uturn-left">Reset</UButton>

            <span class="py-1 bg-transparent rounded font-medium text-zinc-600 min-w-[10vw] text-center">{{
                currentDateFormatted }}
            </span>


            <UCard class="bg-zinc-500/10" :ui="{ body: 'px-2.5 py-1.5 md:px-2.5 md:py-1.5', root: 'ring-0' }">
                <template #default>
                    <div class="flex items-center gap-2 px-2 py-1">
                        <UIcon name="i-heroicons-chevron-double-right" class="text-zinc-500"/>
                        <p class="text-zinc-500 text-sm font-medium">Speed</p>
                        <USlider v-model="speed" :min="1" :max="10" :default-value="5" size="xs" class="w-32" />
                    </div>
                </template>
            </UCard>

        </div>

        <div class="w-full h-auto my-5 overflow-hidden relative" ref="chartContainer"></div>
    </div>
</template>


<script>
import * as d3 from 'd3';

export default {
    name: 'MedalRace',
    props: {
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
    },
    data() {
        return {
            dates: [],
            dailyRankings: {},
            currentDateIndex: 0,
            isAnimating: false,
            animationTimer: null,
            svg: null,
            xScale: null,
            yScale: null,
            countryColors: {},
            currentDate: null,
            speed: 5,
            countries: {},
            width: 0,
            height: 0,
            margin: { top: 50, right: 180, bottom: 50, left: 80 },
            animationRunning: false,
            pathGenerator: null,
            allCountryCodes: new Set()
        };
    },
    computed: {
        currentDateFormatted() {
            if (!this.currentDate) return '';
            const date = new Date(this.currentDate);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        effectiveAnimationDelay() {
            return this.animationDelay / (this.speed / 5);
        }
    },
    async mounted() {
        this.processData();
        this.initializeChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        this.clearAnimation();
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        processData() {
            this.dailyRankings = this.createCumulativeMedalRankings(this.medalData);
            this.dates = Object.keys(this.dailyRankings).sort();

            if (this.dates.length > 0) {
                this.currentDate = this.dates[0];
            }

            // Create a map of country codes to their flag URLs
            this.countries = {};
            this.medalData.forEach(medal => {
                if (!this.countries[medal.country_code.toLowerCase()]) {
                    this.countries[medal.country_code.toLowerCase()] = {
                        img: medal.img
                    };
                }
            });

            // Collect all country codes
            this.dates.forEach(date => {
                this.dailyRankings[date].forEach(entry => {
                    this.allCountryCodes.add(entry.countryCode);
                });
            });

            // Generate consistent colors for each country
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            Array.from(this.allCountryCodes).forEach((countryCode, i) => {
                this.countryColors[countryCode] = colorScale(i);
            });

            this.currentDateIndex = this.dates.indexOf(this.currentDate);
        },

        createCumulativeMedalRankings(medalData) {
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
            console.log(dailyRankings);
            return dailyRankings;
        },


        buildCountryRankHistory(dailyRankings) {
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
        },

        handleResize() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                if (this.svg) {
                    const wasAnimating = this.isAnimating;
                    if (wasAnimating) this.pauseAnimation();

                    this.svg.remove();
                    this.initializeChart();

                    if (wasAnimating) this.startAnimation();
                }
            }, 250);
        },

        getCountryFlag(countryCode) {
            if (!this.countries || !countryCode) return null;
            const lowerCode = countryCode.toLowerCase();
            return this.medalData.find(m => m.country_code.toLowerCase() === lowerCode)?.img || null;
        },

        initializeChart() {
            const container = this.$refs.chartContainer;
            if (!container) return;

            this.width = container.clientWidth || 800;
            this.height = container.clientHeight || 600;

            // Create SVG element
            this.svg = d3.select(container)
                .append('svg')
                .attr('width', '100%')
                .attr('height', this.height)
                .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            // Define scales
            this.xScale = d3.scalePoint()
                .domain(this.dates)
                .range([this.margin.left, this.width - this.margin.right])
                .padding(0.5);

            this.yScale = d3.scaleLinear()
                .domain([20.5, 0.5])
                .range([this.height - this.margin.bottom, this.margin.top])


            // Add axes
            const xAxis = d3.axisBottom(this.xScale)
                .tickFormat(d => {
                    const date = new Date(d);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });

            const yAxis = d3.axisLeft(this.yScale)
                .tickValues([...d3.range(1, 21), 20]);

            this.svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
                .call(xAxis);

            this.svg.append('g')
                .attr('class', 'y-axis')
                .attr('transform', `translate(${this.margin.left},0)`)
                .call(yAxis);

            // Create groups for drawing elements
            this.svg.append('g').attr('class', 'lines-group');
            this.svg.append('g').attr('class', 'labels-group');
            this.svg.append('g').attr('class', 'date-indicator');

            // Path generator for the lines
            this.pathGenerator = d3.line()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.rank))
                .curve(d3.curveMonotoneX);

            this.tooltip = d3.select(container)
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
            this.updateChart(true);
        },

        updateChart(immediate = false) {
            if (!this.dailyRankings || !this.currentDate || !this.svg) {
                console.error("Data or SVG not ready");
                return;
            }

            const duration = immediate ? 0 : this.animationDuration;

            // Get all dates up to current date
            const currentDateIndex = this.dates.indexOf(this.currentDate);
            const relevantDates = this.dates.slice(0, currentDateIndex + 1);

            // Get top 20 countries for current date
            const topCountries = this.dailyRankings[this.currentDate]
                .map(c => c.countryCode);

            // Prepare the line data - one complete path per country
            const lineData = [];

            // Process all countries that have ever been in top 20
            Array.from(this.allCountryCodes).forEach(countryCode => {
                const countryPath = {
                    countryCode: countryCode,
                    country: '',
                    points: []
                };

                // For each date, find this country's position
                let hasAppeared = false;
                relevantDates.forEach(date => {
                    const dateData = this.dailyRankings[date];
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
            const linesGroup = this.svg.select('.lines-group');

            const lines = linesGroup.selectAll('.country-line')
                .data(lineData, d => d.countryCode);

            // Enter: Add new lines
            const enterLines = lines.enter()
                .append('path')
                .attr('class', 'country-line')
                .attr('id', d => `line-${d.countryCode}`)
                .attr('stroke', d => this.countryColors[d.countryCode])
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('opacity', 0.7)
                .on('mouseover', (event, d) => {
                    d3.selectAll('.country-line').attr('opacity', 0.1);
                    d3.select(event.currentTarget).attr('opacity', 1).attr('stroke-width', 5);

                    // Show tooltip
                    this.tooltip
                        .style('opacity', 1)
                        .html(d.country)
                        .style('left', (event.pageX - 300) + 'px')
                        .style('top', (event.pageY - 300) + 'px');
                })
                .on('mousemove', (event) => {
                    // Move tooltip with cursor
                    this.tooltip
                        .style('left', (event.pageX - 200) + 'px')
                        .style('top', (event.pageY - 370) + 'px');
                })
                .on('mouseout', (event, d) => {
                    d3.selectAll('.country-line').attr('opacity', 0.7).attr('stroke-width', 3);
                    // Hide tooltip
                    this.tooltip.style('opacity', 0);
                });

            // Update existing lines
            lines.merge(enterLines)
                .transition()
                .duration(duration)
                .attr('d', d => this.pathGenerator(d.points))
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
                const countryData = this.dailyRankings[this.currentDate]
                    .find(d => d.countryCode === countryCode);

                if (countryData && countryData.rank <= 20) {
                    labelsData.push({
                        countryCode: countryCode,
                        country: countryData.country,
                        rank: countryData.rank,
                        total: countryData.total,
                        x: this.xScale(this.currentDate),
                        y: this.yScale(countryData.rank),
                        flagUrl: this.getCountryFlag(countryCode)
                    });
                }
            });

            const labelsGroup = this.svg.select('.labels-group');
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
                    const flagUrl = this.getCountryFlag(d.countryCode);
                    console.log('Setting flag for', d.country, ':', flagUrl);
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
                .attr('fill', d => this.countryColors[d.countryCode])
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
            const dateIndicator = this.svg.select('.date-indicator');

            // Add line if it doesn't exist
            if (dateIndicator.select('line').empty()) {
                dateIndicator.append('line')
                    .attr('stroke', 'gray')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '2')
                    .attr('y1', this.margin.top)
                    .attr('y2', this.height - this.margin.bottom);

                dateIndicator.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', this.margin.top - 10)
                    .style('fill', 'gray')
                    .style('font-weight', 'bold');
            }

            // Update indicator position
            dateIndicator
                .transition()
                .duration(duration)
                .attr('transform', `translate(${this.xScale(this.currentDate)}, 0)`);

            dateIndicator.select('text')
                .text(new Date(this.currentDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                }));
        },

        startAnimation() {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.animateNextFrame();
        },

        animateNextFrame() {
            if (!this.isAnimating) return;

            if (this.currentDateIndex < this.dates.length - 1) {
                this.currentDateIndex++;
                this.currentDate = this.dates[this.currentDateIndex];

                this.updateChart();

                this.animationTimer = setTimeout(() => {
                    // Only proceed if still animating
                    if (this.isAnimating) {
                        this.animateNextFrame();
                    }
                }, this.effectiveAnimationDelay);
            } else {
                this.isAnimating = false;
            }
        },

        pauseAnimation() {
            this.isAnimating = false;
            this.clearAnimation();
        },

        resetAnimation() {
            this.clearAnimation();
            this.currentDateIndex = 0;
            this.currentDate = this.dates[0];
            this.isAnimating = false;
            this.updateChart(true);
            // Clear old lines
            this.svg.selectAll('.country-line').remove();
            this.svg.selectAll('.label').remove();
            // Optionally stop any ongoing animation
            clearInterval(this.animationInterval);
        },

        clearAnimation() {
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
                this.animationTimer = null;
            }
        }
    }
};
</script>
