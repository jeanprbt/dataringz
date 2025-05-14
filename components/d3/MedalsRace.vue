<template>
    <div class="medals-race">
        <h2>Olympic Medals Race</h2>
        <div class="chart-controls">
            <button @click="startAnimation" :disabled="isAnimating">Start</button>
            <button @click="pauseAnimation" :disabled="!isAnimating">Pause</button>
            <button @click="resetAnimation">Reset</button>
            <span class="current-date">{{ currentDateFormatted }}</span>
            <div class="speed-control">
                <label for="speed">Speed:</label>
                <input type="range" id="speed" v-model="speed" min="1" max="10" />
            </div>
        </div>
        <div class="chart-container" ref="chartContainer"></div>
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
            debugMode: false,
            animationRunning: false,
            pathGenerator: null,
            allCountryCodes: new Set(),
            allTopCountryCodes: new Set() // Countries that have ever been in top 20
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
            // Create cumulative daily medal rankings using the updated function
            this.dailyRankings = this.createCumulativeMedalRankings(this.medalData);

            // Extract dates and sort them chronologically
            this.dates = Object.keys(this.dailyRankings).sort();

            if (this.dates.length > 0) {
                this.currentDate = this.dates[0];
            }

            // Collect all country codes and track countries that have been in top 20
            this.dates.forEach(date => {
                this.dailyRankings[date].forEach(entry => {
                    this.allCountryCodes.add(entry.img);
                    if (entry.rank <= 20) {
                        this.allTopCountryCodes.add(entry.img);
                    }
                });
            });

            // Generate consistent colors for each country
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            Array.from(this.allCountryCodes).forEach((img, i) => {
                this.countryColors[img] = colorScale(i);
            });

            console.log(`Processed ${this.dates.length} dates with ${this.allCountryCodes.size} countries`);
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
                                img: country
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

                    // Assign ranks (no ties - unique rank for each country)
                    for (let j = 0; j < snapshot.length; j++) {
                        snapshot[j].rank = j + 1;
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
                .domain([20.5, 0.5]) // Inverted to have rank 1 at the top
                .range([this.height - this.margin.bottom, this.margin.top]);

            // Clip path to prevent lines from extending below chart area
            this.svg.append('defs')
                .append('clipPath')
                .attr('id', 'chart-area')
                .append('rect')
                .attr('x', this.margin.left)
                .attr('y', this.margin.top)
                .attr('width', this.width - this.margin.left - this.margin.right)
                .attr('height', this.height - this.margin.top - this.margin.bottom);

            // Add horizontal grid lines
            this.svg.append('g')
                .attr('class', 'grid-lines')
                .selectAll('.grid-line')
                .data(d3.range(1, 21))
                .enter()
                .append('line')
                .attr('class', 'grid-line')
                .attr('x1', this.margin.left)
                .attr('x2', this.width - this.margin.right)
                .attr('y1', d => this.yScale(d))
                .attr('y2', d => this.yScale(d))
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 1);

            // Add axes
            const xAxis = d3.axisBottom(this.xScale)
                .tickFormat(d => {
                    const date = new Date(d);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });

            const yAxis = d3.axisLeft(this.yScale)
                .tickValues(d3.range(1, 21))
                .tickFormat(d => d);

            this.svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
                .call(xAxis);

            this.svg.append('g')
                .attr('class', 'y-axis')
                .attr('transform', `translate(${this.margin.left},0)`)
                .call(yAxis);

            // Create groups for drawing elements
            this.svg.append('g')
                .attr('class', 'lines-group')
                .attr('clip-path', 'url(#chart-area)'); // Apply clip path to lines

            this.svg.append('g').attr('class', 'labels-group');
            this.svg.append('g').attr('class', 'date-indicator');

            // Path generator for the lines
            this.pathGenerator = d3.line()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.rank))
                .curve(d3.curveMonotoneX);

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
                .filter(c => c.rank <= 20)
                .map(c => c.img);

            // Prepare the line data - one complete path per country
            const lineData = [];

            // Process all countries that have ever been in top 20
            Array.from(this.allTopCountryCodes).forEach(img => {
                const countryPath = {
                    img: img,
                    country: '',
                    points: []
                };

                // For each date, find this country's position
                let hasAppeared = false;
                relevantDates.forEach(date => {
                    const dateData = this.dailyRankings[date];
                    const countryData = dateData.find(d => d.img === img);

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
                        // Country has no data for this date, place it off-chart but don't render below chart
                        countryPath.points.push({
                            date,
                            rank: 21, // Just below visible area
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
                .data(lineData, d => d.img);

            // Enter: Add new lines
            const enterLines = lines.enter()
                .append('path')
                .attr('class', 'country-line')
                .attr('id', d => `line-${d.img}`)
                .attr('stroke', d => this.countryColors[d.img])
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('opacity', 0.7);

            // Update existing lines
            lines.merge(enterLines)
                .transition()
                .duration(duration)
                .attr('d', d => this.pathGenerator(d.points))
                .attr('opacity', d => {
                    // Only show if in top 20 at current date
                    const isInTop = topCountries.includes(d.img);
                    return isInTop ? 0.7 : 0.1;
                })
                .attr('stroke-width', d => {
                    // Make current top 20 lines thicker
                    const isInTop = topCountries.includes(d.img);
                    return isInTop ? 3 : 1;
                });

            // Update country labels (at the end of lines)
            const labelsData = [];
            topCountries.forEach(img => {
                const countryData = this.dailyRankings[this.currentDate]
                    .find(d => d.img === img);

                if (countryData && countryData.rank <= 20) {
                    labelsData.push({
                        img: img,
                        country: countryData.country,
                        rank: countryData.rank,
                        total: countryData.total,
                        x: this.xScale(this.currentDate),
                        y: this.yScale(countryData.rank)
                    });
                }
            });

            const labelsGroup = this.svg.select('.labels-group');
            const labels = labelsGroup.selectAll('.country-label')
                .data(labelsData, d => d.img);

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
                .attr('id', d => `label-${d.img}`)
                .attr('opacity', 0)
                .attr('transform', d => `translate(${d.x + 10}, ${d.y})`);

            // Add flag image and country name to new labels
            enterLabels.each(function (d) {
                const label = d3.select(this);

                // Add flag image
                label.append('image')
                    .attr('xlink:href', `public/img/countries/${d.img.toLowerCase()}.svg`)
                    .attr('width', 16)
                    .attr('height', 12)
                    .attr('y', -6);

                // Append country name
                label.append('text')
                    .attr('x', 20)
                    .attr('dy', '0.35em')
                    .style('font-size', '12px')
                    .style('font-family', 'sans-serif')
                    .text(`${d.country} (${d.total})`);
            });

            // Merge and animate labels
            labels.merge(enterLabels)
                .transition()
                .duration(duration)
                .attr('opacity', 1)
                .attr('transform', d => `translate(${d.x + 10}, ${d.y})`);

            // Update date indicator
            const dateIndicator = this.svg.select('.date-indicator');

            // Add line if it doesn't exist
            if (dateIndicator.select('line').empty()) {
                dateIndicator.append('line')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '5,5')
                    .attr('y1', this.margin.top)
                    .attr('y2', this.height - this.margin.bottom);

                dateIndicator.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', this.margin.top - 10)
                    .style('fill', 'red')
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

            console.log('Starting animation from date index:', this.currentDateIndex);
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
                console.log('Animation complete');
                this.isAnimating = false;
            }
        },

        pauseAnimation() {
            console.log('Pausing animation');
            this.isAnimating = false;
            this.clearAnimation();
        },

        resetAnimation() {
            console.log('Resetting animation');
            this.clearAnimation();
            this.currentDateIndex = 0;
            this.currentDate = this.dates[0];
            this.isAnimating = false;
            this.updateChart(true);
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

<style scoped>
.medals-race {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h2 {
    margin-bottom: 15px;
}

.chart-container {
    width: 100%;
    height: 600px;
    margin: 20px 0;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
}

.chart-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
}

.chart-controls button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #1976d2;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.chart-controls button:hover:not(:disabled) {
    background-color: #1565c0;
}

.chart-controls button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.current-date {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border-radius: 4px;
    font-weight: bold;
    min-width: 200px;
    text-align: center;
}

.speed-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

@media (max-width: 768px) {
    .chart-controls {
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
