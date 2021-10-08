<template>
    <transition name="zoom">
        <component v-if="optionsAreComplete" :is="component" class="absolute inset-0 flex justify-center" :options="options" :size="screen.size" :event="event" />
    </transition>
</template>
<script>
import ProfilePictures from '@/components/LiveScreens/LED/ProfilePictures'
import FeedPicturesSlideshow from '@/components/LiveScreens/LED/FeedPicturesSlideshow'
import FeedPicturesGrid from '@/components/LiveScreens/LED/FeedPicturesGrid'
import WorldMap from '@/components/LiveScreens/LED/World'
import Question from '@/components/LiveScreens/LED/Question'
import Inquiry from '@/components/LiveScreens/LED/Inquiry'
import BukGames from '@/components/LiveScreens/LED/BUKGames/Leaderboard'
import Wwr from '@/components/LiveScreens/LED/WWR'
import { mapActions, mapGetters } from 'vuex'
import EventBus from '@/utils/eventBus.js'
import DonationsList from '@/components/LiveScreens/shared/DonationsList'
import DonationsTop5 from '@/components/LiveScreens/LED/DonationsTop5'
import DonationsTotal from '@/components/LiveScreens/LED/DonationsTotal'

export default {
    components: {
        BukGames,
        DonationsList,
        DonationsTotal,
        DonationsTop5,
        FeedPicturesGrid,
        FeedPicturesSlideshow,
        Inquiry,
        ProfilePictures,
        Question,
        WorldMap,
        Wwr,
    },
    data: function(){
        return {
            loaded: false
        }
    },
    props: ['screen', 'event'],
    computed: {
        ...mapGetters('screens', ['screenRefFromId']),
        optionsAreComplete() {
            switch (this.screen.options.component) {
                case 'feed-pictures':
                    return Boolean(this.options.view) && (this.options.view == 'grid' ? this.options.columns != null : true)
                case 'question':
                    return this.options.view && this.options.viewType && this.options.question
                default:
                    return true
            }
        },
        options() {
            const { options } = this.screen;
            const propertyName = options.component.split('-').map((v, i) => i == 0 ? v : v.charAt(0).toUpperCase() + v.slice(1)).join('')
            return options[propertyName]
        },
        component(){
            const { component } = this.screen.options;
            const showView = component == 'feed-pictures';
            return `${component}${showView && this.options && this.options.view ? '-' + this.options.view : ''}`;
        }
    },
    methods: {
        ...mapActions('screens', ['refreshedScreen', 'needRefreshScreen']),
    },
    async mounted(){
        const screenRef = this.screenRefFromId(this.event.id, this.screen.id)
        console.dir(screenRef);
        await screenRef.update({ refresh: false, needRefresh: false })
        EventBus.$on('TOKEN_EXPIRED', async () => { await screenRef(this.event.id, this.screen.id).update({ needRefresh: true }) });
        this.loaded = true
    },
    watch: {
        'screen.refresh'(newValue){
            if (this.loaded && newValue) {
                window.location.reload();
            }
        }
    }
}
</script>

<style scoped>
.zoom-enter-active,
.zoom-leave-active {
  transition: opacity 1s, transform 1s;
  position: absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
}
.zoom-enter {
  opacity: 0;
  transform: scale(1.2);
}
.zoom-leave-to {
  opacity: 0;
  transform: scale(.8);
}
</style>
