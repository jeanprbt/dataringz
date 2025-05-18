<template>
    <PageModal :show="showAthletePage" :back="transition" :transition="true" :items="items" @close="closePage"
        @back="router.back()">

        <div :class="['gap-2 md:gap-4 p-2 h-full overflow-x-hidden', { 
            'grid grid-cols-12': selected === 0,
            'grid-rows-9': selected === 0 && !hasBottomCards,
            'grid-rows-12': selected === 0 && hasOneBottomCard,
            'grid-rows-14 md:grid-rows-15': selected === 0 && hasBothBottomCards
        }]">
            <!-- Athlete Profile Picture -->
            <UCard variant="soft" :ui="{ 'body': 'p-0 h-full' }" :class="{
                'col-span-5 md:col-span-2 row-span-4': selected === 0,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <div class="w-full h-full flex items-center justify-center">
                        <AthletePicture :name="athlete.name" :slug="athlete.slug" class="md:hidden" size="lg" />
                        <AthletePicture :name="athlete.name" :slug="athlete.slug" class="hidden md:block" size="xl" />
                    </div>
                </template>
            </UCard>

            <!-- Sports and Events -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-span-5 md:col-span-2 row-span-4 md:row-span-5 row-start-5 md:row-start-5': selected === 0,
                'hidden': selected !== 0 && selected !== 6,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 6,
                'transition-all duration-500 transform h-full': selected === 6
            }" @click="toggleCard(6)" @mouseenter="hoveredCard = 6" @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 6" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(6)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2">Sports & Events</h3>
                        <div v-for="(sport, index) in athlete.sports" :key="index" class="mb-4">
                            <NuxtLink :to="`/sport/${sport.slug}`" class="flex items-center mb-2 hover:underline">
                                <img :src="`/img/sports/SVG/${sport.slug}.svg`" :alt="sport.name"
                                    class="w-6 h-6 mr-2 dark:filter dark:invert dark:brightness-90" />
                                <span class="text-sm font-medium text-zinc-800 dark:text-white">{{ sport.name }}</span>
                            </NuxtLink>
                            <div class="pl-8">
                                <p v-for="(event, eIndex) in athlete.events" :key="eIndex"
                                    class="text-xs text-zinc-600 dark:text-gray-400 mb-1">
                                    {{ event }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between gap-1">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 6" name="i-heroicons-arrow-up-right"
                                class="absolute top-2 right-2" />
                        </transition>
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Sports & Events</h3>
                        <div class="flex flex-col gap-1 my-auto">
                            <div v-for="(sport, index) in athlete.sports" :key="index">
                                <NuxtLink :to="`/sport/${sport.slug}`" class="flex items-center gap-1 hover:underline">
                                    <img :src="`/img/sports/SVG/${sport.slug}.svg`" :alt="sport.name"
                                        class="w-5 h-5 mr-1 dark:filter dark:invert dark:brightness-90" />
                                    <span class="text-xs md:text-sm font-medium text-zinc-800 dark:text-white">{{
                                        sport.name }}</span>
                                </NuxtLink>
                            </div>
                            <p v-if="athlete.events.length <= 2" v-for="(event, index) in athlete.events" :key="index"
                                class="text-xs text-zinc-600 dark:text-gray-400">
                                {{ event }}
                            </p>
                            <p v-else class="text-xs text-zinc-600 dark:text-gray-400">
                                {{ athlete.events.length }} events
                            </p>
                        </div>

                    </div>
                </template>
            </UCard>

            <!-- Basic Info -->
            <UCard variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-span-7 row-span-2 md:col-span-6 md:row-span-2': selected === 0,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex flex-col justify-center h-full">
                        <div class="flex gap-2 items-baseline">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">{{ athlete.name }}
                            </h2>
                            <p v-if="athlete.nickname"
                                class="text-sm md:text-md italic text-gray-500 dark:text-gray-500 line-clamp-2">
                                "{{ athlete.nickname }}"
                            </p>
                        </div>
                        <div v-if="athlete.country" class="flex items-center mt-1">
                            <CountryFlag v-if="athlete.country.code" :code="athlete.country.code"
                                :name="athlete.country.name" size="sm" class="mr-1" />
                            <span class="text-xs md:text-sm text-gray-600 dark:text-gray-400">{{ athlete.country.name
                            }}</span>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Age and Physical Stats -->
            <UCard variant="soft" :ui="{ 'body': 'p-2 h-full' }" :class="{
                'col-span-7 md:col-span-4 row-span-2': selected === 0,
                'hidden': selected !== 0 && selected !== 3
            }">
                <template #default>
                    <div class="flex h-full justify-evenly gap-2 items-center">
                        <div v-if="athlete.age" class="col-span-1 text-center">
                            <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ athlete.age }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Age</div>
                        </div>
                        <div v-if="athlete.gender" class="col-span-1 text-center">
                            <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ athlete.gender
                            }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Gender</div>
                        </div>
                        <div v-if="athlete.height" class="col-span-1 text-center">
                            <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ athlete.height
                            }}cm</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Height</div>
                        </div>
                        <div v-if="athlete.weight" class="col-span-1 text-center">
                            <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ athlete.weight
                            }}kg</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Weight</div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Bio Card -->
            <UCard v-if="athlete.reason || athlete.philosophy" variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-span-7 md:col-span-5 row-span-2 md:row-span-3': selected === 0 && athlete.achievements?.length > 0,
                'col-span-7 md:col-span-5 row-span-5 md:row-span-7': selected === 0 && !athlete.achievements?.length,
                'hidden': (selected !== 0 && selected !== 4) || (!athlete.reason && !athlete.philosophy),
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 4,
                'transition-all duration-500 transform h-full': selected === 4
            }" @click="(athlete.reason || athlete.philosophy) ? toggleCard(4) : () => { }"
                @mouseenter="hoveredCard = 4" @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 4" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0 top-0"
                            @click.stop="toggleCard(4)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-4">Biography</h3>
                        <div class="flex flex-col gap-6">
                            <div v-if="athlete.reason" class="space-y-1">
                                <div class="text-sm font-medium text-zinc-800 dark:text-white">Reason</div>
                                <div class="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed" v-html="athlete.reason"></div>
                            </div>
                            <div v-if="athlete.philosophy" class="space-y-1">
                                <div class="text-sm font-medium text-zinc-800 dark:text-white">Philosophy</div>
                                <div class="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed" v-html="athlete.philosophy"></div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 4" name="i-heroicons-arrow-up-right"
                                class="absolute top-2 right-2" />
                        </transition>
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Biography</h3>
                        <div class="overflow-hidden flex flex-col my-auto">
                            <div v-if="athlete.reason" class="min-h-0 mb-auto">
                                <div class="text-xs md:text-sm text-zinc-800 dark:text-white flex flex-col md:flex-row gap-1">
                                    <span class="text-zinc-500 dark:text-zinc-400 flex-shrink-0">Why:</span>
                                    <div :class="[
                                        athlete.achievements?.length > 0 ? 'line-clamp-3' : 'line-clamp-5',
                                        'text-justify'
                                    ]" v-html="athlete.reason"></div>
                                </div>
                            </div>
                            <div v-if="athlete.philosophy && !athlete.reason" class="min-h-0">
                                <div class="text-xs md:text-sm text-zinc-800 dark:text-white flex flex-col md:flex-row gap-1">
                                    <span class="text-zinc-500 dark:text-zinc-400 flex-shrink-0">Philosophy:</span>
                                    <div :class="[
                                        athlete.achievements?.length > 0 ? 'line-clamp-3' : 'line-clamp-5',
                                        'text-justify'
                                    ]" v-html="athlete.philosophy"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Medal Showcase -->
            <UCard v-if="athlete.achievements && athlete.achievements.length > 0" variant="soft"
                :ui="{ 'body': 'p-4 h-full' }" :class="{
                    'col-span-7 md:col-span-5 row-span-3 md:row-span-7': selected === 0 && (athlete.reason || athlete.philosophy),
                    'col-span-7 md:col-span-5 row-span-4 md:row-span-7': selected === 0 && !athlete.reason && !athlete.philosophy,
                    'hidden': selected !== 0 && selected !== 5,
                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                    'animate-bento-card': selected === 0 && transitioning && previousCard === 5,
                    'transition-all duration-500 transform h-full': selected === 5
                }" @click="selected === 5 ? () => { } : toggleCard(5)" @mouseenter="hoveredCard = 5"
                @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 5" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(5)" />
                        <div class="h-full flex flex-col">
                            <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-4">Olympic Medals</h3>

                            <!-- Medal Statistics -->
                            <div class="grid grid-cols-3 gap-4 mb-4">
                                <div v-for="(count, type) in medalCounts" :key="type"
                                    class="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                    <div
                                        :class="`w-8 h-8 rounded-full flex items-center justify-center ${medalColorClass(type)} mb-1`">
                                        <span class="text-white font-bold text-base">{{ medalEmojiMap[type] }}</span>
                                    </div>
                                    <div class="text-xl font-bold text-zinc-800 dark:text-white">{{ count }}</div>
                                    <div class="text-xs text-zinc-600 dark:text-gray-400">{{ type }}</div>
                                </div>
                            </div>

                            <!-- Detailed Medal List -->
                            <div class="grid grid-cols-1 gap-2 flex-grow">
                                <div v-for="(medal, index) in sortedMedals" :key="index"
                                    class="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                    <div class="flex items-center">
                                        <div
                                            :class="`w-6 h-6 rounded-full flex items-center justify-center ${medalColorClass(medal.type)} mr-2`">
                                            <span class="text-white font-bold text-sm">{{
                                                medalEmojiMap[medal.type.split(' ')[0]] }}</span>
                                        </div>
                                        <div class="flex-grow min-w-0">
                                            <div class="flex items-baseline justify-between">
                                                <div
                                                    class="text-sm font-medium text-zinc-800 dark:text-white truncate mr-2">
                                                    {{ medal.event }}</div>
                                                <div class="text-xs text-zinc-500 dark:text-gray-500 whitespace-nowrap">
                                                    {{ formatDate(medal.date) }}</div>
                                            </div>
                                            <div v-if="medal.discipline"
                                                class="text-xs text-zinc-600 dark:text-gray-400 truncate">
                                                {{ medal.discipline }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between gap-2">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 5" name="i-heroicons-arrow-up-right"
                                class="absolute top-2 right-2" />
                        </transition>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Olympic Medals</h3>
                            <div class="text-xs text-zinc-500 dark:text-gray-400">{{ athlete.achievements.length }} total</div>
                        </div>
                        <div class="flex-1 flex items-center justify-evenly w-full max-w-[250px] mx-auto">
                            <div v-for="(count, type) in medalCounts" :key="type" class="flex flex-col items-center gap-0.5">
                                <div
                                    :class="`w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center ${medalColorClass(type)} transition-transform hover:scale-110`">
                                    <span class="text-white font-bold text-sm md:text-base">{{ medalEmojiMap[type] }}</span>
                                </div>
                                <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ count }}</div>
                            </div>
                        </div>

                        <!-- Preview of medals -->
                        <div class="flex flex-col items-start w-full gap-1">
                            <!-- Mobile view (1 medal) -->
                            <div class="md:hidden w-full">
                                <div v-if="sortedMedals.length > 0"
                                    class="flex items-center text-xs gap-2 px-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-2">
                                    <div
                                        :class="`w-4 h-4 rounded-full flex shrink-0 items-center justify-center ${medalColorClass(sortedMedals[0].type)}`">
                                        <span class="text-white font-bold text-xs">{{ medalEmojiMap[sortedMedals[0].type.split(' ')[0]]
                                        }}</span>
                                    </div>
                                    <div class="flex-1 truncate text-zinc-700 dark:text-zinc-300">{{ sortedMedals[0].event }}</div>
                                    <div class="text-xs text-zinc-500 dark:text-gray-400 whitespace-nowrap">{{ formatDate(sortedMedals[0].date) }}</div>
                                </div>
                                <div v-if="sortedMedals.length > 1"
                                    class="text-xs text-zinc-500 dark:text-gray-400 italic text-center mt-1">
                                    + {{ sortedMedals.length - 1 }} more medals
                                </div>
                            </div>

                            <!-- Tablet and up view (3 medals) -->
                            <div class="hidden md:flex md:flex-col md:w-full md:gap-1">
                                <div v-for="(medal, index) in sortedMedals.slice(0, 3)" :key="index"
                                    class="flex items-center text-xs gap-2 px-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-2">
                                    <div
                                        :class="`w-4 h-4 rounded-full flex shrink-0 items-center justify-center ${medalColorClass(medal.type)}`">
                                        <span class="text-white font-bold text-xs">{{ medalEmojiMap[medal.type.split(' ')[0]]
                                        }}</span>
                                    </div>
                                    <div class="flex-1 truncate text-zinc-700 dark:text-zinc-300">{{ medal.event }}</div>
                                    <div class="text-xs text-zinc-500 dark:text-gray-400 whitespace-nowrap">{{ formatDate(medal.date) }}</div>
                                </div>
                                <div v-if="sortedMedals.length > 3"
                                    class="text-xs text-zinc-500 dark:text-gray-400 italic text-right px-2">
                                    + {{ sortedMedals.length - 3 }} more medals
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Personal Details -->
            <UCard v-if="hasPersonalDetails" variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-start-1 col-span-5 md:col-span-5 row-span-4': selected === 0 && hasPersonalDetails && athlete.achievements?.length > 0 && (athlete.reason || athlete.philosophy),
                'col-start-1 col-span-5 md:col-span-5 row-span-6 md:row-span-7': selected === 0 && hasPersonalDetails && !athlete.achievements?.length,
                'col-start-1 col-span-5 md:col-span-5 row-span-4 md:row-span-7': selected === 0 && hasPersonalDetails && athlete.achievements?.length > 0 && !athlete.reason && !athlete.philosophy,
                'hidden': (selected !== 0 && selected !== 7) || !hasPersonalDetails,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 7,
                'transition-all duration-500 transform h-full': selected === 7
            }" @click="hasPersonalDetails ? toggleCard(7) : () => { }" @mouseenter="hoveredCard = 7"
                @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 7" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(7)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-4">Personal Details</h3>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-if="athlete.birth_date" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-calendar"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Birth Date</div>
                                    <div class="text-sm text-zinc-800 dark:text-white">{{ formatDate(athlete.birth_date)
                                    }}</div>
                                </div>
                            </div>

                            <div v-if="athlete.birth_place" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-map-pin"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Birth Place</div>
                                    <div class="text-sm text-zinc-800 dark:text-white">{{ athlete.birth_place }}{{
                                        athlete.birth_country ? `, ${athlete.birth_country}` : '' }}</div>
                                </div>
                            </div>

                            <div v-if="athlete.occupation" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-briefcase"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Occupation</div>
                                    <div class="text-sm text-zinc-800 dark:text-white">{{ athlete.occupation }}</div>
                                </div>
                            </div>

                            <div v-if="athlete.education" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-academic-cap"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Education</div>
                                    <div class="text-sm text-zinc-800 dark:text-white" v-html="athlete.education"></div>
                                </div>
                            </div>

                            <div v-if="athlete.languages" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-language"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Languages</div>
                                    <div class="text-sm text-zinc-800 dark:text-white">{{ athlete.languages }}</div>
                                </div>
                            </div>

                            <div v-if="athlete.family" class="flex">
                                <div
                                    class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2 flex-shrink-0">
                                    <UIcon name="i-heroicons-user-group"
                                        class="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-xs text-zinc-500 dark:text-zinc-400">Family</div>
                                    <div class="text-sm text-zinc-800 dark:text-white" v-html="athlete.family"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between gap-1">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 7" name="i-heroicons-arrow-up-right"
                                class="absolute right-2 top-2" />
                        </transition>
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Personal Details</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto">
                            <div v-if="athlete.birth_date" class="col-span-1">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-calendar"
                                        class="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                                    <div class="text-xs md:text-sm text-zinc-800 dark:text-white truncate">{{
                                        formatDate(athlete.birth_date) }}</div>
                                </div>
                            </div>
                            <div v-if="athlete.birth_place" class="col-span-1">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-map-pin"
                                        class="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                                    <div class="text-xs md:text-sm text-zinc-800 dark:text-white truncate">{{
                                        athlete.birth_place }}</div>
                                </div>
                            </div>
                            <div v-if="athlete.occupation" class="col-span-1">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-briefcase"
                                        class="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                                    <div class="text-xs md:text-sm text-zinc-800 dark:text-white truncate">{{
                                        athlete.occupation }}</div>
                                </div>
                            </div>
                            <div v-if="athlete.languages" class="col-span-1">
                                <div class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-language"
                                        class="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                                    <div class="text-xs md:text-sm text-zinc-800 dark:text-white truncate">{{
                                        athlete.languages }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Coach and Inspiration -->
            <UCard v-if="athlete.coach || athlete.hero" variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-span-7 md:col-span-full row-span-3': selected === 0 && hasBothBottomCards && athlete.achievements?.length > 0,
                'col-span-7 md:col-span-full row-span-4': selected === 0 && hasOneBottomCard && athlete.achievements?.length > 0,
                'col-span-7 md:col-span-full row-span-5': selected === 0 && !athlete.achievements?.length,
                'hidden': (selected !== 0 && selected !== 8) || (!athlete.coach && !athlete.hero),
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 8,
                'transition-all duration-500 transform h-full': selected === 8
            }" @click="(athlete.coach || athlete.hero) ? toggleCard(8) : () => { }" @mouseenter="hoveredCard = 8"
                @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 8" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(8)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-4">Mentors & Inspiration</h3>

                        <div v-if="athlete.coach" class="mb-4">
                            <div class="text-sm font-medium text-zinc-800 dark:text-white mb-1">Coach</div>
                            <div class="text-sm text-zinc-600 dark:text-gray-400" v-html="athlete.coach"></div>
                        </div>

                        <div v-if="athlete.hero">
                            <div class="text-sm font-medium text-zinc-800 dark:text-white mb-1">Hero/Inspiration</div>
                            <div class="text-sm text-zinc-600 dark:text-gray-400" v-html="athlete.hero"></div>
                        </div>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between gap-1">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 8" name="i-heroicons-arrow-up-right"
                                class="absolute top-2 right-2" />
                        </transition>
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Mentors & Inspiration
                        </h3>
                        <div class="grid sm:grid-cols-2 gap-2 my-auto">
                            <div v-if="athlete.coach">
                                <div class="text-xs md:text-sm text-zinc-800 dark:text-white flex flex-col md:flex-row gap-1">
                                    <span class="text-zinc-500 dark:text-zinc-400 flex-shrink-0">Coach:</span>
                                    <div class="line-clamp-2" v-html="athlete.coach"></div>
                                </div>
                            </div>
                            <div v-if="athlete.hero">
                                <div class="text-xs md:text-sm text-zinc-800 dark:text-white flex flex-col md:flex-row gap-1">
                                    <span class="text-zinc-500 dark:text-zinc-400 flex-shrink-0">Hero:</span>
                                    <div class="line-clamp-2" v-html="athlete.hero"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Hobbies -->
            <UCard v-if="athlete.hobbies" variant="soft" :ui="{ 'body': 'p-4 h-full' }" :class="{
                'col-span-full row-span-2 md:row-span-3': selected === 0 && hasBothBottomCards,
                'col-span-full row-span-3 md:row-span-4': selected === 0 && hasOneBottomCard,
                'hidden': (selected !== 0 && selected !== 9) || !athlete.hobbies,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 9,
                'transition-all duration-500 transform h-full': selected === 9
            }" @click="athlete.hobbies ? toggleCard(9) : () => { }" @mouseenter="hoveredCard = 9"
                @mouseleave="hoveredCard = null">
                <template #default>
                    <div v-if="selected === 9" class="h-full relative overflow-auto">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(9)" />
                        <h3 class="text-lg font-medium text-zinc-800 dark:text-white mb-2">Hobbies & Interests</h3>
                        <p class="text-sm text-zinc-600 dark:text-gray-300">{{ athlete.hobbies }}</p>
                    </div>
                    <div v-else class="h-full flex flex-col justify-between gap-1">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="hoveredCard === 9" name="i-heroicons-arrow-up-right"
                                class="absolute top-2 right-2" />
                        </transition>
                        <h3 class="text-base md:text-lg font-medium text-zinc-800 dark:text-white">Hobbies & Interests
                        </h3>
                        <p class="text-xs md:text-sm text-zinc-600 dark:text-gray-300 line-clamp-3 my-auto">{{
                            athlete.hobbies }}</p>
                    </div>
                </template>
            </UCard>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import athletes from '~/data/athletes.json';

definePageMeta({
    middleware: ['previous', 'breadcrumb'],
    layout: 'canvas'
});

// HANDLE DIRECT URL ---------------
let directAccess = !!useState('athlete').value;
const showAthletePage = ref(!directAccess);
onMounted(async () => {
    if (directAccess) {
        setTimeout(() => showAthletePage.value = true, 4200);
    }
});

// ROUTING PARAMETERS --------------
const router = useRouter();
const route = useRoute();
const slug = route.params.slug as string;

// DATA MANAGEMENT -----------------
const athlete = athletes[slug as keyof typeof athletes] as any;

// HANDLE BREADCRUMB ---------------
const items = useState<Array<{ slug: string, to: string }>>('breadcrumb');

// HANDLE TRANSITION ------------------------------
const previous = useState('previous');
const transition = computed(() => previous.value && previous.value !== '/' && !directAccess) as ComputedRef<boolean>;

// HANDLE CLOSE BUTTON ----------------------------
const closePage = () => {
    showAthletePage.value = false;
    router.push('/');
}

useHead(() => {
    const name = athlete.name;
    const country = athlete.country?.name || '';
    const sports = athlete.sports.map((s: { name: any; }) => s.name).join(', ');
    const medals = athlete.achievements.length > 0
        ? `${athlete.achievements.length} Olympic medals`
        : 'Olympic athlete';

    const title = `${name} - Athlete from ${country}`;
    const description = `${name} is an Olympic athlete from ${country} competing in ${sports}. ${medals}.`;

    return {
        title,
        meta: [
            { name: 'description', content: description },
            // Open Graph / Facebook
            { property: 'og:type', content: 'profile' },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: `https://dataringz.martinctl.dev/athlete/${slug}` },
            { property: 'profile:first_name', content: name.split(' ')[0] },
            { property: 'profile:last_name', content: name.split(' ').slice(1).join(' ') },

            // Twitter
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description }
        ]
    };
});

// UI STATE ------------------------
const selected = ref(0);
const previousCard = ref(0);
const transitioning = ref(false);
const isSmallScreen = ref(false);

const hoveredCard = ref<number | null>(null);

onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const toggleCard = (index: number = 0) => {
    if (selected.value !== 0) {
        previousCard.value = selected.value;
        transitioning.value = true;
        selected.value = 0;
        setTimeout(() => {
            transitioning.value = false;
        }, 500);
    }
    else selected.value = index;
}

// HELPERS ------------------------
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

const medalEmojiMap: Record<string, string> = {
    'Gold': '🥇',
    'Silver': '🥈',
    'Bronze': '🥉'
};

const medalColorClass = (type: string) => {
    const medalType = type.split(' ')[0];
    switch (medalType) {
        case 'Gold': return 'bg-amber-400/60';
        case 'Silver': return 'bg-zinc-400/60';
        case 'Bronze': return 'bg-amber-700/60';
        default: return 'bg-zinc-500/60';
    }
};

// Computed to check if athlete has any personal details to show
const hasPersonalDetails = computed(() => {
    return athlete.birth_date || athlete.birth_place || athlete.occupation ||
        athlete.education || athlete.languages || athlete.family;
});

// Add these computed properties in the script section:
const medalCounts = computed(() => {
    const counts = {
        'Gold': 0,
        'Silver': 0,
        'Bronze': 0
    };

    athlete.achievements.forEach((medal: any) => {
        const type = medal.type.split(' ')[0];
        if (type in counts) {
            counts[type as keyof typeof counts]++;
        }
    });

    return counts;
});

const sortedMedals = computed(() => {
    return [...athlete.achievements].sort((a, b) => {
        // Sort by date (earliest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;

        // If same date, sort by medal type (Gold > Silver > Bronze)
        const typeOrder = { 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
        const typeA = typeOrder[a.type.split(' ')[0] as keyof typeof typeOrder] || 0;
        const typeB = typeOrder[b.type.split(' ')[0] as keyof typeof typeOrder] || 0;
        return typeB - typeA;
    });
});

// Add these computed properties
const hasOneBottomCard = computed(() => {
    return (athlete.coach || athlete.hero || athlete.hobbies) && 
           !((athlete.coach || athlete.hero) && athlete.hobbies);
});

const hasBothBottomCards = computed(() => {
    return (athlete.coach || athlete.hero) && athlete.hobbies;
});

const hasBottomCards = computed(() => {
    return hasOneBottomCard.value || hasBothBottomCards.value;
});
</script>