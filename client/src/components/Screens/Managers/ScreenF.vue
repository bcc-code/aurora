<template>
    <Form :entity="screenOptions" label-root="screen" grid :columns="1">
        <Field name="background" type="text" />
        <Field name="showBackground" inline type="boolean" />
        <Field name="component" type="select" allowEmpty :options="ScreenFComponents" />
        <Information v-if="screenOptions.component === ScreenFComponents.INFORMATION" option="information" />
        <Question v-if="screenOptions.component === ScreenFComponents.QUESTION" option="question" />
        <Donation v-if="screenOptions.component === ScreenFComponents.DONATION" option="donation" />
        <Actions :canSave="hasChanged" @apply="apply" />
    </Form>
</template>

<script>
import { mapModels } from '@/mixins/mapModels';
import { mapActions, mapGetters, mapState } from 'vuex'
import Actions from '../Actions'
import ScreenManager from '@/mixins/ScreenManager.js'
import Information from '../Components/Information'
import Question from '../Components/Question'
import Donation from '../Components/Donation'
export default {
    components: {
        Actions,
        Information,
        Question,
        Donation
    },
    props: ['screen'],
    data: function() {
        return {
            screenOptions: {
                component: null,
                information: null,
                background: null,
                showBackground: null,
                donation: {
                    view: null,
                    ...this.screen.options.donation
                },
                question: {
                    view: null,
                    showCorrectAnswer: true,
                    finished: false,
                    ...this.screen.options.question
                },
            },
        }
    },
    mixins: [ScreenManager],
    computed: {
        ...mapModels(['ScreenFComponents']),
    },
    methods: {
        ...mapActions('contributions', ['bindFeedRef', 'bindDeskRef']),
        ...mapActions('questions', ['bindQuestionsRef']),
    },
    async mounted(){
        await this.bindFeedRef()
        await this.bindQuestionsRef()
        await this.bindDeskRef()
    },
}
</script>