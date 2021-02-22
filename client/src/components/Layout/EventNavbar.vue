<template>
    <div class="flex flex-col bg-mirage m-auto p-auto relative overflow-hidden">
        <div  class="flex overflow-x-scroll py-5 hide-scroll-bar">
            <div class="flex flex-nowrap mx-auto">
                <template v-for="tab in eventTabs">
                    <div :key="tab.name" class="inline-block px-3">
                        <button class="w-32 h-32 max-w-xs overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out text-white"
                            @click="$router.push({ name: tab.name })" v-if="$can(tab.ability)"
                            :class="$route.name == tab.name ? 'gradient-active' : 'bg-bluewood'">
                            <div class="text-white rounded-lg p-2 text-center text-4xl">
                                <i :class="`fa fa-${tab.icon}`"></i>
                            </div>
                            <p class="font-semibold">{{$t(`menu.${tab.name}`)}} {{tab.id}}</p>
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data: function () {
        return {
            eventTabs: [
                { name: 'dashboard', icon: 'edit', ability: 'admin' },
                { name: 'gameboard', icon: 'question-circle', ability: 'admin' },
                { name: 'inquiries', icon: 'question', ability: 'desk' },
                { name: 'inquiries-queue', icon: 'question', ability: 'admin' },
                { name: 'program', icon: 'list-alt', ability: 'admin' },
                { name: 'profile-pictures', icon: 'user-circle', ability: 'desk' },
                { name: 'competition', icon: 'running', ability: 'desk' },
                { name: 'translations', icon: 'language', ability: 'translate' },
                { name: 'feed', icon: 'envelope', ability: 'desk' },
                { name: 'desk', icon: 'info-circle', ability: 'desk' },
                { name: 'queue',icon: 'stream', ability: 'desk' },
                { name: 'screens', icon: 'desktop', ability: 'admin' }
            ]
        }
    }
}
</script>
<style>
.hide-scroll-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scroll-bar::-webkit-scrollbar {
  display: none;
}
</style>