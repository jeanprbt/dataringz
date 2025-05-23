<template>
  <div v-if="countryData" class="w-full space-y-4 p-8">
    <div v-for="edition in sortedEditions" :key="edition.year" 
         :class="[
           'w-full bg-white rounded-lg overflow-hidden transform transition-all duration-200',
           edition.rank === 1 ? 'ring-2 ring-yellow-400' : 
           edition.rank === 2 ? 'ring-2 ring-gray-300' :
           edition.rank === 3 ? 'ring-2 ring-amber-600' : ''
         ]">
      <div class="p-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <img v-if="getHostFlag(edition.city)" 
                 :src="getHostFlag(edition.city)" 
                 :alt="edition.city + ' flag'" 
                 class="w-12 h-8 object-cover rounded" />
            <div>
              <h3 class="text-xl font-bold text-gray-800">{{ edition.year }} {{ capitalizeCity(edition.city) }}</h3>
            </div>
          </div>
          <div :class="[
            'text-2xl font-bold px-4 py-2 rounded-full',
            edition.rank === 1 ? 'bg-yellow-400 text-white' :
            edition.rank === 2 ? 'bg-gray-300 text-white' :
            edition.rank === 3 ? 'bg-amber-600 text-white' :
            'bg-gray-100 text-gray-600'
          ]">
            #{{ edition.rank }}
          </div>
        </div>

        <div class="mt-4 flex justify-center space-x-8">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-2">
              <span class="font-bold text-xl text-white">{{ edition.Gold }}</span>
            </div>
            <span class="text-sm font-medium text-gray-600">Gold</span>
          </div>
          
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-2">
              <span class="font-bold text-xl text-white">{{ edition.Silver }}</span>
            </div>
            <span class="text-sm font-medium text-gray-600">Silver</span>
          </div>
          
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center mb-2">
              <span class="font-bold text-xl text-white">{{ edition.Bronze }}</span>
            </div>
            <span class="text-sm font-medium text-gray-600">Bronze</span>
          </div>
          
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <span class="font-bold text-xl text-white">{{ edition.Total }}</span>
            </div>
            <span class="text-sm font-medium text-gray-600">Total</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!countryData" class="text-center text-gray-500 py-8">
      No historical data available for this country
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import medalData from '../data/previous_editions_medals.json'
import countries from '../data/countries.json'

// Map Olympic cities to their country slugs
const hostCities = {
  'tokyo': 'japan',
  'rio': 'brazil',
  'london': 'great-britain',
  'beijing': 'china',
  'athens': 'greece',
  'sydney': 'australia',
  'atlanta': 'united-states'
}

const props = defineProps({
  countrySlug: {
    type: String,
    required: true
  }
})

const countryData = ref(null)
const countryInfo = computed(() => countries[props.countrySlug])

// Add computed property for sorted editions
const sortedEditions = computed(() => {
  if (!countryData.value) return []
  return [...countryData.value].sort((a, b) => b.year - a.year)
})

const loadCountryData = () => {
  countryData.value = medalData[props.countrySlug]
}

const capitalizeCity = (city) => {
  return city.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getHostFlag = (city) => {
  const hostCountry = hostCities[city.toLowerCase()]
  return hostCountry ? countries[hostCountry]?.img : null
}

watch(() => props.countrySlug, (newSlug) => {
  loadCountryData()
})

onMounted(() => {
  loadCountryData()
})
</script>
