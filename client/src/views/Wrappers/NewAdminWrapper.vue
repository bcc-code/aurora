<template>
    <div class="min-h-screen bg-ebony text-white">
        <Navbar />
        <main class="pb-8">
            <transition name="height">
                <EventNavbar class="mb-5" v-if="selectedEvent" />
            </transition>
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8" style="min-height: calc(100vh - 27rem)">
                <router-view v-if="isAuthenticated && isMounted" />
                <Spinner center v-else />
            </div>
        </main>
        <footer>
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
                <div class="border-t border-gray-200 py-8 text-sm text-gray-500 text-center sm:text-left"><span class="block sm:inline">&copy; 2021 Brunstad Christian Church. </span>
                <span class="block sm:inline">All rights reserved.</span></div>
            </div>
        </footer>
    </div>
</template>
<script>
import Navbar from '@/components/Layout/Navbar'
import EventNavbar from '@/components/Layout/EventNavbar'
import { mapActions, mapGetters, mapState } from 'vuex'
import keys from '@/utils/keys'
export default {
    components: {
        Navbar,
        EventNavbar
    },
	data: function(){
		return {
			isMounted: false
		}
	},
	computed: {
        ...mapState('session', ['isAuthenticated']),
        ...mapGetters('events', ['selectedEvent'])
	},
	async mounted(){
        await this.bindTemplates();
        await this.bindConfigRef();
        await this.bindCompetitionsRef();
        this.isMounted = true;
	},
	methods: {
		...mapActions('templates', ['bindTemplates']),
		...mapActions('configs', ['bindConfigRef']),
		...mapActions('competitions', ['bindCompetitionsRef']),
	},
	watch: {
		'$route.name': {
			immediate: true,
			handler(value) {
				var pageName = this.$t(`menu.${value}`)
				document.title = `${pageName} | Admin | ${keys.APP.NAME}`;
			}
		}
	}
}
</script>
<style>
    .height-enter-active, .height-leave-active {
        @apply duration-500;
        max-height: 12rem;
    }

    .height-enter, .height-leave-to {
        @apply opacity-0;
        max-height: 0px;
    }

    .fade-enter-active, .fade-leave-active {
        @apply duration-300;
        @apply ease-in-out;
    }

    .fade-enter, .fade-leave-to {
        @apply opacity-0;
    }
</style>