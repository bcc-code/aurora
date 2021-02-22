<template>
    <header class="bg-mirage">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-6xl lg:px-8">
            <div class="relative py-10 lg:py-5 flex items-center justify-center lg:justify-between">
                <div class="absolute left-0 flex-shrink-0 lg:static">
                    <router-link to="/" class="text-lg lg:text-2xl font-bold text-white">
                        {{appName}}
                    </router-link>
                </div>

                <!-- Right section on desktop -->
                <div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5">
                    <div class="ml-4 relative flex-shrink-0" v-click-outside="() => { if (profileOpen) closeProfile() }">
                        <div>
                            <button type="button" @click="toggleProfile" class="flex text-sm ring-2 items-center ring-white ring-opacity-20 focus:outline-none focus:ring-opacity-100" id="user-menu" aria-haspopup="true">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-8 w-8 rounded-full" :src="userInfo ? userInfo.picture : require('@/assets/img/pp-default.jpg')">
                                <span class="hidden ml-3 text-white text-sm font-medium lg:block">
                                    <span class="sr-only">Open user menu for </span>{{userInfo ? userInfo.name : ''}}
                                </span>
                                <svg class="hidden flex-shrink-0 ml-1 h-5 w-5 text-gray-300 lg:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div :class="profileOpen ? 'opacity-100 scale-100': 'opacity-0 scale-95'" class="origin-top-right z-40 absolute -right-2 mt-2 w-48 rounded-md shadow-lg py-1 bg-clay ring-1 ring-black ring-opacity-5 tranfsorm transition ease-in duration-75" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                            <a href="#" class="block px-4 py-2 text-sm text-white" role="menuitem">Sign out</a>
                        </div>
                    </div>
                </div>

                <!-- Menu button -->
                <div class="absolute right-0 flex-shrink-0 lg:hidden">
                    <button @click="toggleMobileMenu" class="bg-transparent p-2 rounded-md inline-flex items-center justify-center text-indigo-200 hover:text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg :class="mobileMenu ? 'hidden': 'block'" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div :class="mobileMenu ? 'opacity-100': 'opacity-0 pointer-events-none'" class="duration-150 ease-in-out transition-opacity z-20 fixed inset-0 bg-black bg-opacity-25 lg:hidden" aria-hidden="true"></div>
        <div :class="mobileMenu ? 'opacity-100 scale-100': 'opacity-0 scale-95 pointer-events-none'" class="duration-150 ease-in-out z-30 absolute top-0 inset-x-0 max-w-3xl mx-auto w-full p-2 transition transform origin-top lg:hidden">
            <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-clay divide-y divide-gray-600">
                <div class="pt-3 pb-2">
                    <div class="flex items-center justify-between px-4">
                        <div>
                            <span class="text-lg lg:text-2xl font-bold text-white">{{appName}}</span>
                        </div>
                        <div class="-mr-2">
                            <button type="button" @click="mobileMenu = false" class="bg-clay rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                <span class="sr-only">Close menu</span>
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pt-4 pb-2">
                    <div class="flex items-center px-5">
                        <div class="flex-shrink-0">
                            <img class="h-10 w-10 rounded-full" :src="userInfo ? userInfo.picture : require('@/assets/img/pp-default.jpg')">
                        </div>
                        <div class="ml-3 min-w-0 flex-1">
                            <div class="text-base font-medium text-white truncate">{{userInfo ? userInfo.name : ''}}</div>
                        </div>
                    </div>
                    <div class="mt-3 px-2 space-y-1">
                        <a href="#" class="block rounded-md px-3 py-2 text-base text-white font-medium">Sign out</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
<script>
import ClickOutside from 'vue-click-outside'
import { mapState, mapActions } from 'vuex'
import keys from '@/utils/keys'
export default {
    directives: { ClickOutside },
    data: function () {
        return {
            mobileMenu: false
        }
    },
    computed: {
        ...mapState('session', ['userInfo', 'profileOpen']),
        appName() {
            return keys.APP.NAME
        }
    },
    methods: {
        ...mapActions('session', ['toggleProfile', 'closeProfile']),
        toggleMobileMenu() {
            this.mobileMenu = !this.mobileMenu
        }
    }
    
}
</script>