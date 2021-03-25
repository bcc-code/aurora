<template>
    <transition name="slide-up">
        <Information v-if="screen.options.component == ScreenFComponents.INFORMATION && screen.options.information && screen.options.information.information"
            class="absolute ml-32 mb-20 bottom-0 w-4/6"
            :information="screen.options.information.information"
            showTitle  size="big"/>
        <template v-else-if="screen.options.component === ScreenFComponents.QUESTION && screen.options.question && screen.options.question.question">
            <QuestionWinner class="fix-bottom w-4/6" v-if="screen.options.question.view === ScreenFQuestionViews.WINNER" :isDobbel="false" :question="screen.options.question.question" :options="screen.options.question" />
            <Question class="fix-bottom pr-20 w-full" v-else :options="screen.options.question"/>
        </template>
        <Program v-else-if="screen.options.component == ScreenFComponents.PROGRAM"/>
        <Inquiry v-else-if="screen.options.component == ScreenFComponents.INQUIRY" />
        <CheckinsCount v-else-if="screen.options.component == ScreenFComponents.CHECKINSCOUNT" class="fix-bottom"/>
        <DonationStatus
        v-else-if="screen.options.component == ScreenFComponents.DONATION"
        :donationView="screen.options.donation.view"
        class="fix-bottom" />
        <VerseDisplay v-else-if="screen.options.component == ScreenFComponents.VERSE" :displayTime="screen.options.verse.displayTime" :displayPrevious="screen.options.verse.displayPrevious" />
    </transition>
</template>
<script>
import Information from '@/components/LiveScreens/TV/ScreenF/Information.vue'
import Program from '@/components/LiveScreens/TV/ScreenF/Program.vue'
import Inquiry from '@/components/LiveScreens/TV/ScreenF/Inquiry.vue'
import Question from '@/components/LiveScreens/TV/ScreenF/Question.vue'
import QuestionWinner from '@/components/LiveScreens/TV/Question/QuestionWinner.vue'
import DonationStatus from '@/components/LiveScreens/TV/ScreenF/Donation.vue'
import CheckinsCount from '@/components/LiveScreens/shared/CheckinsCount.vue'
import VerseDisplay from '@/components/LiveScreens/TV/ScreenF/VerseDisplay.vue'
import { mapModels } from '@/mixins/mapModels'
import { mapGetters } from 'vuex'
export default {
    components: {
        Information,
        Program,
        Inquiry,
        Question,
        QuestionWinner,
        CheckinsCount,
        DonationStatus,
        VerseDisplay,
    },
    props: ['screen', 'logo'],
    computed: {
        ...mapGetters('screens', ['currentScreenFromId']),
        ...mapModels(['ScreenFComponents', 'ScreenFQuestionViews']),
        squeezeBackSize(){
            return this.currentScreenFromId('A').options.squeezeBackSize;
        }
    }

}
</script>
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: opacity 1.3s, transform 1.3s;
}

.slide-up-enter, .slide-up-leave-to {
    opacity: 0;
    transform: translateX(10%);
}
.fix-bottom {
    @apply absolute;
    @apply bottom-0;
    @apply left-0;
    @apply pb-20;
    @apply pl-20;
}
</style>
