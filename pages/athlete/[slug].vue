<template>
    <PageModal :show="showAthletePage" :back="transition" :transition="transition" :items="items" @close="closePage"
        @back="router.back()">

        <div v-if="athlete"
            :class="['gap-4 p-2 h-full', { 'grid grid-cols-12 md:grid-rows-6': selected === 0 && !hasFewInfo, 'grid grid-cols-12 md:grid-rows-10': selected === 0 && hasFewInfo }]">

            <UCard v-if="profilePicture" variant="soft" :ui="{ 'body': 'p-0 md:p-0 h-full' }" :class="{
                'col-span-6 md:col-span-2 md:row-span-2': selected === 0 && !hasFewInfo,
                'col-span-6 md:col-span-2 md:row-span-4': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 1
            }">
                <template #default>
                    <div class="w-full h-full rounded-lg flex justify-center items-center aspect-square">
                        <img :src="`/storage/athletes/images/${slug}.jpg`" class="w-full h-full object-cover rounded-lg"
                            :alt="athlete.name" />
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-6 md:col-span-4': selected === 0 && profilePicture,
                'col-span-12 md:col-span-4': selected === 0 && !profilePicture,
                'row-span-1': selected === 0 && !hasFewInfo,
                'row-span-2': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 2
            }">
                <template #default>
                    <div class="flex w-full h-full justify-left gap-4">
                        <img v-if="!isSmallScreen" class="rounded-lg w-1/6 dark:invert dark:brightness-80"
                            :src="`/img/sports/SVG/${mainSport.slug}.svg`" />
                        <div class="flex flex-col justify-center">
                            <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">
                                {{ athlete.name }}
                            </h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ mainSport.name }}
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'md:row-span-2': selected === 0 && !hasFewInfo,
                'md:row-span-4': selected === 0 && hasFewInfo,
                'col-span-12 md:col-span-6': profilePicture && selected === 0,
                'col-span-12 md:col-span-8': !profilePicture && selected === 0,
                'hidden': selected !== 0 && selected !== 3,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 3,
                'animate-full-screen h-full': selected === 3,
            }">
                <template #default>
                    <div v-if="selected === 3" class="h-full relative flex flex-col gap-2">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(3)" />
                        <h2 class="text-sm md:text-xl font-bold text-zinc-800 dark:text-white">Events</h2>
                        <div class="grid [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))] gap-4 h-full">
                            <NuxtLink v-for="(event, index) in athleteEvents" :to="`/event/${event.slug}`" :key="index"
                                :class="[
                                    'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                                ]">
                                {{ event.name }}
                            </NuxtLink>

                        </div>
                    </div>
                    <div v-else class="w-full h-full rounded-lg flex flex-col gap-2 relative">
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Events</h2>
                        <div
                            class="grid gap-3 h-full [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))] auto-rows-fr ">
                            <NuxtLink v-for="(event, index) in compactEvents" :to="`/event/${event.slug}`" :key="index"
                                :class="[
                                    'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-center [text-wrap:balance]',
                                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                                ]">
                                {{ event.name }}
                            </NuxtLink>
                            <div v-if="athleteEvents.length > 3" @click="toggleCard(3)"
                                @mouseenter="eventsCardHovered = true" @mouseleave="eventsCardHovered = false" :class="[
                                    'text-sm text-zinc-600 dark:text-gray-300 rounded-lg py-2 px-3 bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center text-center border-2 border-dashed border-zinc-300 dark:border-zinc-600',
                                    'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30 cursor-pointer'
                                ]">
                                <transition enter-active-class="transition-opacity duration-500"
                                    enter-from-class="opacity-0" enter-to-class="opacity-100"
                                    leave-active-class="transition-opacity duration-500" leave-from-class="opacity-100"
                                    leave-to-class="opacity-0" mode="out-in">
                                    <UIcon v-if="eventsCardHovered && athlete.events.length > 3"
                                        name="i-heroicons-arrow-up-right" class="absolute top-2 right-2" />
                                </transition>
                                +{{ athleteEvents.length - compactEvents.length }} more
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-8 md:col-span-4 row-span-1': selected === 0 && !hasFewInfo,
                'col-span-8 md:col-span-4 row-span-2': selected === 0 && hasFewInfo,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning,
                'hidden': selected !== 0 && selected !== 4
            }">
                <template #default>
                    <NuxtLink :to="`/country/${athleteCountry.slug}`" class="flex items-center h-full gap-4">
                        <img class="rounded-lg w-1/6" :src="athleteCountry.img" :alt="athleteCountry.name" />
                        <div class="flex flex-col h-full justify-center">
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Country</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athleteCountry.name }}
                            </p>
                        </div>
                    </NuxtLink>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-4 md:col-span-1 row-span-1': selected === 0 && !hasFewInfo,
                'col-span-4 md:col-span-1 row-span-2': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 5
            }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 :class="['text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1']">
                                Age</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.age }}
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-3 md:col-span-1 row-span-1': selected === 0 && !hasFewInfo,
                'col-span-3 md:col-span-1 row-span-2': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 6
            }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Sex</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.gender }}
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-9 md:col-span-4 row-span-1': selected === 0 && !hasFewInfo,
                'col-span-9 md:col-span-4 row-span-2': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 7
            }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Birth</h2>
                            <div class="flex gap-2 items-center">
                                <div class="flex gap-1 items-center">
                                    <UIcon name="i-heroicons-calendar-days" />
                                    <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                        {{ isSmallScreen ? formatDate(athlete.birth_date, "short") :
                                            formatDate(athlete.birth_date) }}
                                    </p>
                                </div>

                                <div class="flex items-center">
                                    <UIcon v-if="athlete.birth_place" name="i-heroicons-map-pin" />
                                    <p
                                        :class="[{ 'md:text-sm': athlete.birth_place.length <= 25 }, 'text-[9px] text-gray-600 dark:text-gray-400']">
                                        {{ athlete.birth_place }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.height && hasMedals && !athlete.education && !athlete.psychology && !athlete.reason"
                variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                    'col-span-6 md:col-span-2 md:row-span-1': selected === 0 && !hasFewInfo,
                    'col-span-6 md:col-span-2 md:row-span-2': selected === 0 && hasFewInfo,
                    'hidden': selected !== 0 && selected !== 14
                }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Height</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ formatHeight(athlete.height) }}
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.reason || athlete.psychology" variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-12 md:col-span-6 md:row-span-1': selected === 0 && (hasMedals && (athlete.education || !athlete.coach)) || (!hasMedals && !athlete.education),
                'col-span-12 md:col-span-6 md:row-span-2': selected === 0 && hasFewInfo,
                'col-span-12 md:col-span-3 md:row-span-1': selected === 0 && hasMedals && !athlete.education && athlete.coach,
                'col-span-12 md:col-span-6 md:row-span-4': selected === 0 && !hasMedals && athlete.education,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && bioExpandable,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 8,
                'animate-full-screen h-full': selected === 8,
                'hidden': selected !== 0 && selected !== 8
            }" @click="selected === 8 ? () => { } : bioExpandable ? toggleCard(8) : () => { }"
                @mouseenter="motivationCardHovered = true" @mouseleave="motivationCardHovered = false">
                <template #default>
                    <div v-if="selected === 8" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(8)" />

                        <div class="h-full flex flex-col gap-4 p-1">
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Biography</h2>
                            <div v-if="athlete.reason" class="flex gap-3">
                                <UIcon name="i-heroicons-newspaper"
                                    class="flex-shrink-0 mt-1 text-zinc-600 dark:text-zinc-400" />
                                <div class="flex-1">
                                    <h3 class="text-base font-medium text-zinc-800 dark:text-white mb-1">Reason</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ athlete.reason }}</p>
                                </div>
                            </div>

                            <div v-if="athlete.philosophy" class="flex gap-3">
                                <UIcon name="i-heroicons-light-bulb"
                                    class="flex-shrink-0 mt-1 text-zinc-600 dark:text-zinc-400" />
                                <div class="flex-1">
                                    <h3 class="text-base font-medium text-zinc-800 dark:text-white mb-1">Philosophy</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ athlete.philosophy }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else
                        :class="['h-full rounded-lg relative', { 'flex items-center': hasMedals || !athlete.education }]">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="motivationCardHovered && bioExpandable" name="i-heroicons-arrow-up-right"
                                class="absolute top-1 right-1" />
                        </transition>
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Biography</h2>
                            <p v-if="hasMedals || (!hasMedals && !athlete.education)"
                                class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ compactBio }}
                            </p>
                            <div v-else class="mt-4">
                                <div v-if="athlete.reason" class="flex gap-3">
                                    <UIcon name="i-heroicons-newspaper"
                                        class="flex-shrink-0 mt-1 text-zinc-600 dark:text-zinc-400" />
                                    <div class="flex-1">
                                        <h3 class="text-base font-medium text-zinc-800 dark:text-white mb-1">Reason</h3>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ athlete.reason }}</p>
                                    </div>
                                </div>
                                <div v-if="athlete.philosophy" class="flex gap-3">
                                    <UIcon name="i-heroicons-light-bulb"
                                        class="flex-shrink-0 mt-1 text-zinc-600 dark:text-zinc-400" />
                                    <div class="flex-1">
                                        <h3 class="text-base font-medium text-zinc-800 dark:text-white mb-1">Philosophy
                                        </h3>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ athlete.philosophy }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.coach && !athlete.education" variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-12 md:col-span-3 md:row-span-1': selected === 0 && !athlete.education,
                'col-span-12 md:col-span-3 md:row-span-2': selected === 0 && hasFewInfo,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && coachExpandable,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 10,
                'transition-all duration-500 transform h-full': selected === 10,
                'hidden': selected !== 0 && selected !== 10
            }" @click="selected === 10 ? () => { } : coachExpandable ? toggleCard(10) : () => { }"
                @mouseenter="coachCard1Hovered = true" @mouseleave="coachCard1Hovered = false">
                <template #default>
                    <div v-if="selected === 10" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(10)" />
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Coach</h2>
                        <div class="flex flex-col gap-2 h-full">
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.coach }}
                            </p>
                        </div>
                    </div>
                    <div v-else class="flex items-center h-full rounded-lg relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="coachCard1Hovered && coachExpandable" name="i-heroicons-arrow-up-right"
                                class="absolute top-0 right-0" />
                        </transition>
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Coach</h2>
                            <div class="flex flex-col gap-2 h-full">
                                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    {{ compactCoach }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.education" variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-12 md:col-span-6 md:row-span-2': selected === 0 && !hasFewInfo,
                'col-span-12 md:col-span-6 md:row-span-4': selected === 0 && hasFewInfo,
                'hidden': selected !== 0 && selected !== 9
            }">
                <template #default>
                    <div class="w-full h-full rounded-lg">
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-3">Education</h2>
                        <div class="flex flex-col gap-2 h-full">
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.education }}
                            </p>
                            <div v-if="athlete.languages" class="flex items-center gap-2">
                                <UIcon name="i-heroicons-language" />
                                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                    {{ athlete.languages }}</p>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.medals && athlete.medals.length > 0" variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-12 md:col-span-6 row-span-1 md:row-span-3': selected === 0 && athlete.education,
                'col-span-12 md:row-span-3': selected === 0 && !athlete.education,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && athlete.medals.length > 3,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 11,
                'transition-all duration-500 transform h-full': selected === 11,
                'hidden': selected !== 0 && selected !== 11
            }" @click="selected === 11 ? () => { } : athlete.medals.length > 3 ? toggleCard(11) : () => { }"
                @mouseenter="medalsCardHovered = true" @mouseleave="medalsCardHovered = false">
                <template #default>
                    <div class="w-full h-full rounded-lg">
                        <div v-if="selected === 11" class="h-full relative">
                            <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                                @click.stop="toggleCard(11)" />
                            <div class="h-full flex flex-col">
                                <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-2">
                                    Olympic Medals
                                </h2>
                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div v-for="(count, type) in medalCounts" :key="type"
                                        class="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                        <div
                                            :class="`w-8 h-8 rounded-full flex items-center justify-center ${medalColorClass(type)} mb-1`">
                                            <span class="text-white font-bold text-base">
                                                {{ medalEmojiMap[type] }}
                                            </span>
                                        </div>
                                        <div class="text-xl font-bold text-zinc-800 dark:text-white">{{ count }}</div>
                                        <div class="text-xs text-zinc-600 dark:text-gray-400">{{ type }}</div>
                                    </div>
                                </div>
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
                                                    <div
                                                        class="text-xs text-zinc-500 dark:text-gray-500 whitespace-nowrap">
                                                        {{ formatAthleteDate(medal.date) }}</div>
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
                        <div v-else class="h-full flex flex-col justify-between gap-2 relative">
                            <transition enter-active-class="transition-opacity duration-500"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-500" leave-from-class="opacity-100"
                                leave-to-class="opacity-0" mode="out-in">
                                <UIcon v-if="medalsCardHovered && athlete.medals.length > 3"
                                    name="i-heroicons-arrow-up-right" class="absolute top-2 right-2" />
                            </transition>
                            <div class="flex flex-col items-left">
                                <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">
                                    Olympic Medals
                                </h2>
                                <div class="text-xs text-zinc-500 dark:text-gray-400">{{ athlete.medals.length }}
                                    total</div>
                            </div>
                            <div class="flex-1 flex items-center justify-evenly w-full max-w-[250px] mx-auto">
                                <div v-for="(count, type) in medalCounts" :key="type"
                                    class="flex flex-col items-center gap-0.5">
                                    <div
                                        :class="`w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center ${medalColorClass(type)} transition-transform hover:scale-110`">
                                        <span class="text-white font-bold text-sm md:text-base">{{ medalEmojiMap[type]
                                        }}</span>
                                    </div>
                                    <div class="text-sm md:text-base font-bold text-zinc-800 dark:text-white">{{ count
                                    }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col items-start w-full gap-1">
                                <div class="md:hidden w-full">
                                    <div v-if="sortedMedals.length > 0"
                                        class="flex items-center text-xs gap-2 px-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-2">
                                        <div
                                            :class="`w-4 h-4 rounded-full flex shrink-0 items-center justify-center ${medalColorClass(sortedMedals[0].type)}`">
                                            <span class="text-white font-bold text-xs">{{
                                                medalEmojiMap[sortedMedals[0].type.split(' ')[0]]
                                            }}</span>
                                        </div>
                                        <div class="flex-1 truncate text-zinc-700  dark:text-zinc-300">{{
                                            sortedMedals[0].event }}</div>
                                        <div class="text-xs text-zinc-500 dark:text-gray-400 whitespace-nowrap">{{
                                            formatAthleteDate(sortedMedals[0].date) }}</div>
                                    </div>
                                    <div v-if="sortedMedals.length > 1"
                                        class="text-xs text-zinc-500 dark:text-gray-400 italic text-center mt-1">
                                        + {{ sortedMedals.length - 1 }} more medals
                                    </div>
                                </div>

                                <div class="hidden md:flex md:flex-col md:w-full md:gap-1">
                                    <div v-for="(medal, index) in sortedMedals.slice(0, 3)" :key="index"
                                        class="flex items-center text-xs gap-2 px-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-2">
                                        <div
                                            :class="`w-4 h-4 rounded-full flex shrink-0 items-center justify-center ${medalColorClass(medal.type)}`">
                                            <span class="text-white font-bold text-xs">
                                                {{ medalEmojiMap[medal.type.split(' ')[0]] }}
                                            </span>
                                        </div>
                                        <div class="flex-1 truncate text-zinc-700 dark:text-zinc-300">{{ medal.event }}
                                        </div>
                                        <div class="text-xs text-zinc-500 dark:text-gray-400 whitespace-nowrap">{{
                                            formatAthleteDate(medal.date) }}</div>
                                    </div>
                                    <div v-if="sortedMedals.length > 3"
                                        class="text-xs text-zinc-500 dark:text-gray-400 italic text-right px-2">
                                        + {{ sortedMedals.length - 3 }} more medals
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.coach && athlete.education" variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                'col-span-12 md:col-span-6 md:row-span-1': selected === 0 && !hasFewInfo,
                'col-span-12 md:col-span-6 md:row-span-2': selected === 0 && hasFewInfo,
                'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50': selected === 0 && !transitioning && coachExpandable,
                'animate-bento-card': selected === 0 && transitioning && previousCard === 12,
                'transition-all duration-500 transform h-full': selected === 12,
                'hidden': selected !== 0 && selected !== 12
            }" @click="selected === 12 ? () => { } : coachExpandable ? toggleCard(12) : () => { }"
                @mouseenter="coachCard2Hovered = true" @mouseleave="coachCard2Hovered = false">
                <template #default>
                    <div v-if="selected === 12" class="h-full relative">
                        <UButton variant="ghost" icon="i-heroicons-arrows-pointing-in" class="absolute right-0"
                            @click.stop="toggleCard(12)" />
                        <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Coach</h2>
                        <div class="flex flex-col gap-2 h-full">
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.coach }}
                            </p>
                        </div>
                    </div>
                    <div v-else class="flex items-center h-full rounded-lg relative">
                        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
                            leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                            <UIcon v-if="coachCard2Hovered && coachExpandable" name="i-heroicons-arrow-up-right"
                                class="absolute top-0 right-0" />
                        </transition>
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white mb-1">Coach</h2>
                            <div class="flex flex-col gap-2 h-full">
                                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    {{ compactCoach }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard
                v-if="athlete.height && ((!athlete.reason && !athlete.philosophy && athlete.education && hasMedals) || !hasMedals)"
                variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                    'col-span-6 md:col-span-2 md:row-span-1': selected === 0 && !hasFewInfo,
                    'col-span-6 md:col-span-2 md:row-span-2': selected === 0 && hasFewInfo,
                    'hidden': selected !== 0 && selected !== 13
                }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Height</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ formatHeight(athlete.height) }}
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>

            <UCard v-if="athlete.weight && ((!athlete.reason && !athlete.philosophy && hasMedals) || !hasMedals)"
                variant="soft" :ui="{ 'body': 'h-full' }" :class="{
                    'col-span-6 md:col-span-2 md:row-span-1': selected === 0 && !hasFewInfo,
                    'col-span-6 md:col-span-2 md:row-span-2': selected === 0 && hasFewInfo,
                    'hidden': selected !== 0 && selected !== 14
                }">
                <template #default>
                    <div class="flex items-center h-full rounded-lg">
                        <div>
                            <h2 class="text-lg md:text-xl font-bold text-zinc-800 dark:text-white">Weight</h2>
                            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                {{ athlete.weight }} kg
                            </p>
                        </div>
                    </div>
                </template>
            </UCard>
        </div>
        <div v-else class="h-full flex items-center justify-center">
            <p class="text-sm md:text-sm text-gray-600 dark:text-gray-400">Athlete not found.</p>
        </div>
    </PageModal>
</template>

<script setup lang="ts">
import athletes from '~/data/athletes.json';
import sports from '~/data/sports.json';
import events from '~/data/events.json';
import countries from '~/data/countries.json';

definePageMeta({
    middleware: ['athlete', 'previous', 'breadcrumb'],
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
const athleteCountry = athlete ? countries[athlete.country as keyof typeof countries] as any : {} as any;
let athleteSports: any[] = [];
if (athlete) {
    for (const sportSlug of athlete.sports) {
        athleteSports.push(sports[sportSlug as keyof typeof sports]);
    }
}
const mainSport = athlete && athleteSports.length > 0 ? athleteSports[0] as any : {} as any;
let athleteEvents: any[] = [];
if (athlete) {
    for (const eventSlug of athlete.events) {
        athleteEvents.push(events[eventSlug as keyof typeof events]);
    }
}

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

// UI STATE ------------------------
const selected = ref(0);
const previousCard = ref(0);
const transitioning = ref(false);
const isSmallScreen = ref(false);
const motivationCardHovered = ref(false);
const medalsCardHovered = ref(false);
const eventsCardHovered = ref(false);
const coachCard1Hovered = ref(false);
const coachCard2Hovered = ref(false);
const bioExpandable = computed(() => {
    if (!hasMedals && athlete.education) return false;
    if (athlete.reason && athlete.philosophy) return true;
    if (athlete.reason) return athlete.coach && !athlete.education ? athlete.reason.length > 30 : athlete.reason.length > 60;
    if (athlete.philosophy) return athlete.coach && !athlete.education ? athlete.philosophy.length > 30 : athlete.philosophy.length > 60;
    return false;
});
const coachExpandable = computed(() => athlete.coach && athlete.coach.length > 35);
const compactBio = computed(() => {
    const text = athlete.reason || athlete.philosophy || '';
    const limit = athlete.coach && !athlete.education ? 30 : 60;
    if (text.length <= limit && bioExpandable.value) return text + '...';
    if (text.length <= limit) return text;
    const lastSpaceIndex = text.substring(0, limit).lastIndexOf(' ');
    if (lastSpaceIndex === -1) return text.substring(0, limit) + '...';
    return text.substring(0, lastSpaceIndex) + '...';
});
const compactCoach = computed(() => {
    const text = athlete.coach;
    if (text.length <= 35) return text;
    const lastSpaceIndex = text.substring(0, 35).lastIndexOf(' ');
    if (lastSpaceIndex === -1) return text.substring(0, 35) + '...';
    return text.substring(0, lastSpaceIndex) + '...';
})
const compactEvents = computed(() => athleteEvents.slice(0, 3));
const profilePicture = computed(() => slug && athlete && athlete.image && athlete.image.should_show_image);
const hasMedals = computed(() => athlete && athlete.medals && athlete.medals.length > 0);
const hasFewInfo = computed(() => athlete && !hasMedals.value && (!athlete.education || (!athlete.reason && !athlete.philosophy)));

onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateScreenSize = () => {
        isSmallScreen.value = mediaQuery.matches;
    };
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
});

const toggleCard = (index: number = 0) => {
    motivationCardHovered.value = false;
    medalsCardHovered.value = false;
    coachCard1Hovered.value = false;
    coachCard2Hovered.value = false;
    eventsCardHovered.value = false;
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

const medalCounts = computed(() => {
    const counts = {
        'Gold': 0,
        'Silver': 0,
        'Bronze': 0
    };
    athlete.medals.forEach((medal: any) => {
        const type = medal.type.split(' ')[0];
        if (type in counts) {
            counts[type as keyof typeof counts]++;
        }
    });

    return counts;
});

const sortedMedals = computed(
    () => [...athlete.medals].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        const typeOrder = { 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
        const typeA = typeOrder[a.type.split(' ')[0] as keyof typeof typeOrder] || 0;
        const typeB = typeOrder[b.type.split(' ')[0] as keyof typeof typeOrder] || 0;
        return typeB - typeA;
    })
);

useHead(() => {
    if (athlete === undefined) return;
    const name = athlete.name;
    const country = athleteCountry.name || '';
    const sports = athleteSports;
    const medals = athlete.medals.length > 0
        ? `${athlete.medals.length} Olympic medals`
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
        ],
        link: [
            { rel: 'canonical', href: `https://dataringz.martinctl.dev/athlete/${slug}` },
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        ]
    };
});
</script>