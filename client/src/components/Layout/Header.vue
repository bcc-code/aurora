<template>
    <section class="w-full text-white bg-background-2">
        <div class="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
            <div class="flex flex-row items-center justify-between p-4">
                <div class="flex flex-wrap items-center">
                    <router-link to="/" class="text-xs md:text-sm lg:text-lg font-semibold text-white uppercase rounded-lg focus:outline-none focus:shadow-outline">
                        {{appName}}
                    </router-link>
                    <template v-if="selectedEvent != null">
                        <span class="mx-3">-</span>
                        <router-link :to="{ name:'dashboard', params: { eventId: selectedEvent.id } }"
                            class="text-xs md:text-sm lg:text-lg font-semibold uppercase rounded-lg focus:outline-none focus:shadow-outline"
                            :class="isCurrentEvent ? 'text-green-500' : 'text-white'">
                            {{selectedEvent.name}}
                        </router-link>
                    </template>
                </div>
                <button class="rounded-lg md:hidden focus:outline-none focus:shadow-outline" @click="openMenu = !openMenu">
                    <i class="fa fa-bars" v-show="!openMenu"></i>
                    <i class="fa fa-times" v-show="openMenu"></i>
                </button>
            </div>
            <nav :class="{'flex': openMenu, 'hidden': !openMenu}" class="flex-col flex-grow pb-4 md:pb-0 md:flex md:justify-end md:flex-row">
                <div class="relative">
                    <template v-if="selectedEvent != null">
                        <button v-click-outside="hideEvent" @click="openEvent = !openEvent" class="flex flex-row text-white items-center w-full px-4 py-2 mt-2 text-sm font-semibold text-left rounded-lg md:w-auto md:inline md:mt-0 md:ml-4 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline">
                            <span>{{$t('menu.event')}}</span>
                            <svg fill="currentColor" viewBox="0 0 20 20" :class="{'rotate-180': openEvent, 'rotate-0': !openEvent}" class="inline w-4 h-4 mt-1 ml-1 transition-transform duration-200 transform md:-mt-1"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                        <transition enter-active-class="transition ease-out duration-100" enter-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75" leave-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                            <div v-show="openEvent" class="absolute z-50 right-0 w-full md:max-w-screen-sm md:w-screen mt-2 origin-top-right">
                                <div class="px-2 pt-2 pb-4 bg-background-2-plain rounded-md shadow-lg">
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
                                        <template v-for="tab in eventTabs">
                                            <router-link :key="tab.name" :to="tab.route" v-if="$can(tab.ability)"
                                                class="flex flex row items-start rounded-lg bg-transparent p-2 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline"
                                                exact
                                                active-class="text-tint-1 border-2 border-tint-1 font-medium">
                                                <div class="bg-teal-500 text-white rounded-lg p-2 h-10 w-10 text-center">
                                                    <i :class="`fa fa-${tab.icon}`"></i>
                                                </div>
                                                <div class="ml-3 mt-2">
                                                    <p class="font-semibold">{{$t(`menu.${tab.name}`)}} {{tab.id}}</p>
                                                </div>
                                            </router-link>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </template>
                    <button v-if="selectedEvent != null && $can('admin', selectedEvent)" v-click-outside="hideScreen" @click="openScreen = !openScreen" class="flex flex-row text-white items-center w-full px-4 py-2 mt-2 text-sm font-semibold text-left rounded-lg md:w-auto md:inline md:mt-0 md:ml-4 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline">
                        <span>{{$t('menu.screens')}}</span>
                        <svg fill="currentColor" viewBox="0 0 20 20" :class="{'rotate-180': openScreen, 'rotate-0': !openScreen}" class="inline w-4 h-4 mt-1 ml-1 transition-transform duration-200 transform md:-mt-1"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    </button>
                    <transition enter-active-class="transition ease-out duration-100" enter-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75" leave-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <div v-show="openScreen" class="absolute z-50 right-0 w-full md:max-w-screen-sm md:w-screen mt-2 origin-top-right">
                            <div class="px-2 pt-2 pb-4 bg-background-2-plain rounded-md shadow-lg">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
                                    <a v-for="screen in screens" :key="screen.id" :href="`${origin}/screens/${screen.id}`"
                                        class="flex flex row items-start rounded-lg bg-transparent p-2 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline">
                                        <div class="bg-teal-500 text-white rounded-lg p-3 h-12 w-12 text-center">
                                            <i :class="`fa fa-${screen.icon}`"></i>
                                        </div>
                                        <div class="ml-3">
                                            <p class="font-semibold">{{$t('menu.screen')}} {{screen.id}}</p>
                                            <p v-if="screen.component" class="text-sm">{{screen.component | modelName}}</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>    
            </nav>
        </div>
    </section>
</template>
<script>
import ClickOutside from 'vue-click-outside'
import { mapState, mapGetters, mapActions} from 'vuex'
import keys from '@/utils/keys'
export default {
    data: function(){
        return {
            openScreen: false,
            openEvent: false,
            openMenu: false,
            eventTabs: [
                { route: { name: 'dashboard' }, name: 'event', icon: 'edit', ability: 'admin' },
                { route: { name: 'gameboard' }, name: 'gameboard', icon: 'question-circle', ability: 'admin' },
                { route: { name: 'inquiries' }, name: 'inquiries', icon: 'question', ability: 'desk' },
                { route: { name: 'inquiries-queue' }, name: 'inquiries-queue', icon: 'question', ability: 'admin' },
                { route: { name: 'program' }, name: 'program', icon: 'list-alt', ability: 'admin' },
                { route: { name: 'profile-pictures' }, name: 'profile-pictures', icon: 'user-circle', ability: 'desk' },
                { route: { name: 'competition' }, name: 'competition', icon: 'running', ability: 'desk' },
                { route: { name: 'translations' }, name: 'translations', icon: 'language', ability: 'translate' },
                { route: { name: 'contributions' }, name: 'contributions', icon: 'check-circle', ability: 'desk' },
                { route: { name: 'desk' }, name: 'desk', icon: 'info-circle', ability: 'desk' },
                { route: { name: 'queue' }, name: 'queue',icon: 'stream', ability: 'desk' },
                { route: { name: 'screens' }, name: 'screens', icon: 'desktop', ability: 'admin' }
            ]
        }
    },
    directives: {
        ClickOutside
    },
    computed: {
        ...mapState('screens', ['currentScreens']),
        ...mapGetters('events', ['selectedEvent', 'currentEvent', 'currentEventRef']),
        isCurrentEvent(){
            return this.currentEvent != null && this.selectedEvent.id == this.currentEvent.id;
        },
        origin(){
            return window.location.origin
        },
        screens(){
            if (this.currentScreens != null)
                return this.currentScreens.map((screen) => {
                    var result = { id: screen.id, component: screen.options.component};
                    switch(screen.id){
                        case 'A':
                        case 'F':
                            result.icon = 'tv';
                            break;
                        default:
                            result.icon = 'th';
                            break;
                    }
                    return result
                })
            return [{ id: 1, icon: 'th'}, {id: 2, icon: 'th'}, {id: 3, icon: 'th'}, {id: 'A', icon: 'th'}, {id: 'F', icon: 'th'}]
        },
        appName() {
            return keys.APP.NAME
        }
    },
    methods: {
        ...mapActions('screens', ['bindCurrentScreensRef']),
        hideScreen(){
            this.openScreen = false;
        },
        hideEvent() {
            this.openEvent = false;
        }
    },
    watch: {
        async currentEventRef(value){
            if (value != null) {
                await this.bindCurrentScreensRef();
            }
        }
    }
}
</script>