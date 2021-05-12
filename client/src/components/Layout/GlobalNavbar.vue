<template>
    <div class="flex flex-col m-auto p-auto bg-mirage relative overflow-hidden">
        <div  class="flex overflow-x-scroll py-5 hide-scroll-bar">
            <div class="flex flex-nowrap mx-auto">
                <template v-for="tab in tabs">
                    <div :key="tab.name" class="inline-block px-3">
                        <router-link :to="{ name: tab.name }" class="inline-block text-center w-20 h-20 lg:w-24 lg:h-24 py-1 lg:py-2 max-w-xs overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out text-white"
                            v-if="$can(tab.ability)"
                            :class="$route.name == tab.name ? 'gradient-active' : 'bg-bluewood'">
                            <div class="text-white rounded-lg p-2 text-center text-2xl lg:text-3xl">
                                <i :class="`fa fa-${tab.icon}`"></i>
                            </div>
                            <p class="font-semibold text-xs lg:text-sm">{{$t(`menu.${tab.name}`)}} {{tab.id}}</p>
                        </router-link>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    data: function () {
        return {
            tabs: [
                { name: 'globalconf', icon: 'cog', ability: 'admin' },
                { name: 'impex', icon: 'exchange-alt', ability: 'admin' }
            ]
        }
    },
    computed: {
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
