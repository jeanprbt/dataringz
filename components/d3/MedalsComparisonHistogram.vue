<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex flex-wrap justify-left items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Compare</span>
            <div
                class="min-w-[12rem] max-w-[16rem] w-fit relative inline-flex items-center px-3 py-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg">
                <div class="flex items-center gap-2 flex-1">
                    <img :src="currentCountry?.img" :alt="currentCountry?.name"
                        class="w-6 h-6 rounded-full object-cover" />
                    <span class="text-sm text-gray-900 dark:text-white truncate">{{ currentCountry.name }}</span>
                </div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">with</span>
            <USelectMenu v-model="selectedCountry" :avatar="selectedCountry?.avatar" :items="availableCountries"
                class="w-64" />
            <span class="text-sm text-gray-600 dark:text-gray-400">on</span>
            <USelectMenu v-model="selectedSport" :avatar="selectedSport?.avatar" :items="availableSports"
                class="w-64" />
        </div>
        <div ref="chartContainer" class="flex-1 w-full min-h-[40vh]"></div>
        <div class="flex flex-wrap items-center justify-center text-sm mt-2 gap-4">
            <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 opacity-80 mr-1 rounded"></div>
                <span class="text-xs sm:text-sm">{{ currentCountry?.name || countrySlug }}</span>
            </div>
            <div class="flex items-center" v-if="selectedCountry">
                <div class="w-3 h-3 bg-[#ed902f] opacity-80 mr-1 rounded"></div>
                <span class="text-xs sm:text-sm">{{ selectedCountry.label }}</span>
            </div>
        </div>
    </div>
    <div ref="tooltip" class="absolute hidden bg-white dark:bg-zinc-800 p-2 rounded shadow-lg text-sm" />
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import medals from '~/data/medals.json'
import sports from '~/data/sports.json'
import countries from '~/data/countries.json'

const getCountryBySlug = (slug: string) => {
    return (countries as any)[slug]
}

const getCountryByCode = (code: string) => {
    return Object.values(countries).find((country: any) => country.country_code === code)
}

const props = defineProps({
    countrySlug: {
        type: String,
        required: true,
    }
})

type SelectableCountry = {
    label: string;
    value: string;
    avatar: {
        src: string;
        alt: string;
    };
};
type SelectableSport = {
    label: string;
    value: string;
    avatar: {
        src: any;
        alt: string;
        class: string;
    };
};

const selectedSport = ref<SelectableSport | undefined>({
    label: 'All Sports',
    value: 'all',
    avatar: {
        src: '/img/olympics.svg',
        alt: 'All Sports',
        class: ''
    }
})
const selectedCountry = ref<SelectableCountry | undefined>(undefined)
const chartContainer = ref<HTMLElement | null>(null)
const tooltip = ref<HTMLElement | null>(null)

const currentCountry = computed(() => getCountryBySlug(props.countrySlug))

const availableCountries = computed(() => {
    const usedCountryCodes = Array.from(new Set(medals.map((m) => m.country_code)))
    return usedCountryCodes
        .filter(code => code !== currentCountry.value?.country_code)
        .map(code => {
            const country = getCountryByCode(code)
            return {
                label: country?.name || code,
                value: code,
                avatar: {
                    src: country?.img || `/img/olympics.svg`,
                    alt: country?.name || code
                }
            }
        })
        .sort((a, b) => a.label.localeCompare(b.label))
})

const availableSports = computed(() => {
    const allSports = Object.entries(sports as any).map(([key, sport]: [string, any]) => ({
        label: sport.name,
        value: key,
        avatar: {
            src: sport.icon,
            alt: sport.name,
            class: 'dark:invert dark:brightness-100 bg-transparent'
        }
    }))

    // Add "All Sports" option
    return [
        {
            label: 'All Sports',
            value: 'all',
            avatar: {
                src: '/img/olympics.svg',
                alt: 'All Sports',
                class: ''
            }
        },
        ...allSports
    ]
})

const normalizeSportName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-')
}

const filteredMedals = computed(() => {
    const compareCountry = selectedCountry.value?.value
    const currentCountryCode = currentCountry.value?.country_code
    const selectedSportValue = selectedSport.value?.value === 'all' ? 'all' : normalizeSportName(selectedSport.value?.value || '')

    return medals.filter((m) => {
        const isRelevantCountry = m.country_code === currentCountryCode || m.country_code === compareCountry
        const isRelevantSport = selectedSportValue === 'all' || normalizeSportName(m.discipline) === selectedSportValue
        return isRelevantCountry && isRelevantSport
    })
})


const medalCounts = computed(() => {
    const currentCountryCode = currentCountry.value?.country_code
    const counts: Record<string, Record<string, number>> = {
        [currentCountryCode]: { Gold: 0, Silver: 0, Bronze: 0 }
    }

    if (selectedCountry.value?.value) {
        counts[selectedCountry.value.value] = { Gold: 0, Silver: 0, Bronze: 0 }
    }

    for (const m of filteredMedals.value) {
        const type = m.medal_type.replace(' Medal', '')
        if (counts[m.country_code]) {
            counts[m.country_code][type]++
        }
    }

    return counts
})

// Update createHistogram function
const createHistogram = () => {
    if (!chartContainer.value) return
    
    // Clear previous chart
    d3.select(chartContainer.value).selectAll('*').remove()

    const currentCountryCode = currentCountry.value?.country_code
    const compareCountry = selectedCountry.value?.value

    const data = ['Gold', 'Silver', 'Bronze'].map((medal) => {
        const result: any = { medal }
        result[currentCountryCode] = medalCounts.value[currentCountryCode][medal]
        if (compareCountry) {
            result[compareCountry] = medalCounts.value[compareCountry]?.[medal] || 0
        }
        return result
    })

    const margin = { top: 40, right: 30, bottom: 40, left: 40 }
    const width = chartContainer.value.clientWidth - margin.left - margin.right
    const height = chartContainer.value.clientHeight - margin.top - margin.bottom || 400

    const svg = d3
        .select(chartContainer.value)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const x0 = d3.scaleBand()
        .domain(['Gold', 'Silver', 'Bronze'])
        .range([0, width])
        .paddingInner(0.2)

    // Only create inner scale if there's a comparison country
    const x1 = compareCountry ? d3
        .scaleBand()
        .domain([currentCountryCode, compareCountry])
        .range([0, x0.bandwidth()])
        .padding(0.05) : null

    const color = d3
        .scaleOrdinal<string, string>()
        .domain([currentCountryCode, compareCountry].filter(Boolean))
        .range(['#3b82f6', '#ed902f'])

    // Calculate max value for bar height scaling with some padding for labels
    const maxValue = d3.max(data, (d) => {
        const values = [d[currentCountryCode]]
        if (compareCountry) values.push(d[compareCountry] || 0)
        return Math.max(...values)
    }) || 10
    
    // Add some padding to avoid label cutoff
    const yMaxWithPadding = maxValue * 1.15

    const y = d3
        .scaleLinear()
        .domain([0, yMaxWithPadding])
        .nice()
        .range([height, 0])

    const bars = svg
        .append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d) => `translate(${x0(d.medal)},0)`)

    if (compareCountry) {
        // Create selection for double bars
        const rectSelection = bars.selectAll('rect')
            .data(d => [currentCountryCode, compareCountry].map(key => ({
                key,
                medal: d.medal,
                value: d[key] || 0
            })))
            .join('rect')
            .attr('x', d => x1!(d.key) || 0)
            .attr('y', height) // Start from bottom for animation
            .attr('width', x1!.bandwidth())
            .attr('height', 0) // Start with height 0 for animation
            .attr('fill', d => color(d.key))
            .attr('rx', 4)
        
        // Set up event handlers before animation
        rectSelection
            .on('mouseover', function(event, d) {
                if (!tooltip.value) return
                const country = getCountryByCode(d.key)
                tooltip.value.innerHTML = `${country?.name || d.key} - ${d.medal}: ${d.value}`
                tooltip.value.style.display = 'block'
                tooltip.value.style.left = `${event.pageX - 100}px`
                tooltip.value.style.top = `${event.pageY - 150}px`
            })
            .on('mouseout', () => {
                if (tooltip.value) tooltip.value.style.display = 'none'
            })
            .on('mousemove', (event) => {
                if (!tooltip.value) return
                tooltip.value.style.left = `${event.pageX - 100}px`
                tooltip.value.style.top = `${event.pageY - 150}px`
            })

        // Apply the animation
        rectSelection.transition()
            .duration(800)
            .delay((d, i) => i * 100) // Stagger the animations
            .ease(d3.easeCubicOut) // Smoother easing
            .attr('y', d => y(d.value))
            .attr('height', d => height - y(d.value))

        // Add text labels above bars
        bars.selectAll('text')
            .data(d => [currentCountryCode, compareCountry].map(key => ({
                key,
                medal: d.medal,
                value: d[key] || 0
            })))
            .join('text')
            .attr('x', d => (x1!(d.key) || 0) + x1!.bandwidth() / 2)
            .attr('y', d => Math.max(y(d.value) - 10, 15)) // Ensure text isn't too high with added margin
            .attr('text-anchor', 'middle')
            .attr('fill', 'currentColor')
            .text(d => d.value)
            .style('opacity', 0) // Start with opacity 0
            .transition()
            .delay(600) // Delay appearance until bars are mostly visible
            .duration(400)
            .style('opacity', 1) // Fade in
    } else {
        // Single bars when no comparison is selected
        const rectSelection = bars.append('rect')
            .attr('x', 0)
            .attr('y', height) // Start from bottom for animation
            .attr('width', x0.bandwidth())
            .attr('height', 0) // Start with height 0 for animation
            .attr('fill', color(currentCountryCode))
            .attr('rx', 4)
            
        // Set up event handlers before animation
        rectSelection
            .on('mouseover', function(event, d) {
                if (!tooltip.value) return
                const country = getCountryByCode(currentCountryCode)
                tooltip.value.innerHTML = `${country?.name || currentCountryCode} - ${d.medal}: ${d[currentCountryCode]}`
                tooltip.value.style.display = 'block'
                tooltip.value.style.left = `${event.pageX - 100}px`
                tooltip.value.style.top = `${event.pageY - 150}px`
            })
            .on('mouseout', () => {
                if (tooltip.value) tooltip.value.style.display = 'none'
            })
            .on('mousemove', (event) => {
                if (!tooltip.value) return
                tooltip.value.style.left = `${event.pageX - 100}px`
                tooltip.value.style.top = `${event.pageY - 150}px`
            })
            
        // Apply the animation
        rectSelection.transition()
            .duration(800)
            .ease(d3.easeCubicOut) // Smoother easing
            .attr('y', d => y(d[currentCountryCode]))
            .attr('height', d => height - y(d[currentCountryCode]))

        // Add text labels above bars
        bars.append('text')
            .attr('x', x0.bandwidth() / 2)
            .attr('y', d => Math.max(y(d[currentCountryCode]) - 10, 15)) // Ensure text isn't too high with added margin
            .attr('text-anchor', 'middle')
            .attr('fill', 'currentColor')
            .text(d => d[currentCountryCode])
            .style('opacity', 0) // Start with opacity 0
            .transition()
            .delay(600) // Delay appearance until bars are mostly visible
            .duration(400)
            .style('opacity', 1) // Fade in
    }

    // Only show x-axis (medal types)
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickSizeOuter(0))
}

watch([selectedCountry, selectedSport], () => {
    createHistogram()
}, { deep: true })


onMounted(() => {
    createHistogram()

    window.addEventListener('resize', () => {
        createHistogram()
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', createHistogram)
})
</script>
