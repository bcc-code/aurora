<template>
    <section class="text-white flex w-full h-full overflow-hidden">

        <video show="dummyVideo" src="https://storage.googleapis.com/bcc-online-backgrounds/1642599846.mp4" autoplay="autoplay" muted="muted" style="" loop="" :class="{
            'video-normal': isNormal,
            'video-double': isDobbel,
        }"/>

        <div class="h-full relative transition-all" :class="{ 'w-8/12': isNormal, 'w-5/12': isDobbel }">
            <div class="faded-bg absolute inset-0 h-full pl-24 pr-6 flex flex-col justify-start" :class="{ 'py-12' : isNormal, 'py-16' : isDobbel }">
                <div class="flex justify-center items-center mb-8" style="min-height: 194px; max-height:194px;" v-if="isDobbel">
                    <Logo class="w-auto" :style="logoStyle.split(';').filter((el) => el.includes('transform')).join(';')"/>
                </div>
                <div class="flex flex-col items-center" :class="{ 'pt-2': isNormal }">
                    <div style="z-index:1;" class="overflow-hidden rounded-r-lg relative w-full pb-16/9 shadow-xl">
                        <!-- Livestream comes here -->
                    </div>
                    <transition name="fade-karaoke">
                        <Clock v-if="!karaokeMode" class="px-10 text-3xl font-semibold bg-light text-black shadow-lg rounded-b-full" :class="{ 'self-end mr-8': isDobbel, 'self-start ml-12': isNormal }"/>
                    </transition>
                </div>
                <transition name="fade-karaoke">
                    <section v-if="!karaokeMode" class="w-full flex flex-1 items-center" :class="{'pl-8' : isNormal }">
                        <DistanceTracker class="mt-3" v-if="screen.options.component === ScreenAComponents.WWR" />
                        <template v-else>
                            <div class="h-48" style="width: 300px; min-width: 300px" v-if="isNormal">
                                <Logo class="w-auto" :style="logoStyle"/>
                            </div>
                            <div class="w-full flex pb-3">
                                <Information class="self-end flex pb-3" v-if="screen.options.component === ScreenAComponents.INFORMATION && hasInformation" size="big" showTitle :information="screen.options.information.information" />
                                <DefaultText class="self-end flex pb-3" v-if="screen.options.component === ScreenAComponents.DEFAULTTEXT" size="big" showTitle :textContent="screen.options" />
                                <template v-if="screen.options.component === ScreenAComponents.QUESTION && screen.options.question.question != null" class="w-full flex flex-col items-end" :class="{ 'pt-2': isNormal }">
                                    <div v-if="screen.options.question.view === ScreenAQuestionViews.WINNER" class="w-full flex flex-col items-end" :class="{ 'pt-2': isNormal }">
                                        <div class="w-full" :class="isDobbel ? 'mt-8' : ''">
                                            <QuestionWinner :isDobbel="isDobbel" :question="screen.options.question.question" :options="screen.options.question" />
                                        </div>
                                    </div>
                                </template>
                                <DonationBar v-if="screen.options.component === ScreenAComponents.DONATION" :size="isNormal ? 'normal': 'small'" :showResults="screen.options.donation.showResults" />
                            </div>
                        </template>
                    </section>
                </transition>
            </div>
        </div>
        <div class="h-full overflow-y-auto pl-2 pr-20" :class="{'w-2/6': isNormal, 'w-7/12 flex shadow-over-bottom': isDobbel }">
            <transition name="fade" mode="out-in" duration="500">
                <component v-bind:is="sideComponent" :columns="isDobbel ? 2: 1" />
            </transition>
        </div>
    </section>
</template>
<script>
import Feed from '@/components/LiveScreens/TV/ScreenA/Feed'
import Information from '@/components/Feed/Information'
import DefaultText from '@/components/Feed/DefaultText'
import Logo from '@/components/Logo'
import NextEvent from '@/components/LiveScreens/TV/ScreenA/NextEvent'
import Clock from '@/components/LiveScreens/TV/ScreenA/Clock'
import DonationSide from '@/components/LiveScreens/TV/ScreenA/DonationSide';
import DonationBar from '@/components/LiveScreens/TV/ScreenA/Donation';
import DistanceTracker from '@/components/LiveScreens/TV/ScreenA/WWR/DistanceTracker'
import QuestionWinner from '@/components/LiveScreens/TV/Question/QuestionWinner';
import { mapModels } from '@/mixins/mapModels'
import { mapGetters } from 'vuex'
import keys from '@/utils/keys'

export default {
    components: {
        Feed,
        Information,
        Logo,
        Clock,
        NextEvent,
        DonationSide,
        DonationBar,
        QuestionWinner,
        DistanceTracker,
        DefaultText,
    },
    data: () => ({
        dummyVideo: false, // Quickfix because it was showing up in production
    }),
    props: ['screen', 'logoStyle'],
    computed: {
        ...mapModels(['ScreenAComponents', 'ScreenAQuestionViews']),
        ...mapGetters('events', ['currentEvent']),
        isNormal() {
            return this.screen.options.squeezeBackSize == 'normal'
        },
        isDobbel() {
            return this.screen.options.squeezeBackSize == 'dobbel'
        },
        hasInformation() {
            return this.screen.options.information != null
                && this.screen.options.information.information != null
                && this.screen.options.information.information != ''
        },
        sideComponent() {
            return this.screen.options.showDonationSide && this.isNormal ? DonationSide : Feed
        },
        karaokeMode() {
            return this.isNormal && this.screen.options.karaokeMode
        },
  }
}
</script>
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-karaoke-enter-active, .fade-karaoke-leave-active {
  transition: opacity 500ms;
}

.fade-karaoke-enter, .fade-karaoke-leave-to {
  opacity: 0;
}

.video-double {
    position: absolute;
    top: 289px;
    left: 96px;
    width: 678px;
}

.video-normal {
    position: absolute;
    top: 57px;
    left: 96px;
    width: 1155px;
}
</style>
