<template>
    <Form :entity="screenOptions" label-root="screen" grid :columns="1">
        <Field name="background" type="text" />
        <Field name="showBackground" inline type="boolean" />
        <Field name="squeezeBackSize" label="screen.size" type="select" :options="['dobbel', 'normal']" />
        <Field name="component" type="select" :options="ScreenAComponents" />

        <Information v-if="screenOptions.component === ScreenAComponents.INFORMATION" option="information" />
        <DefaultText v-if="screenOptions.component === ScreenAComponents.DEFAULTTEXT" option="defaultText" />

        <Question v-if="screenOptions.component === ScreenAComponents.QUESTION" option="question" />
        <Donation v-if="screenOptions.component === ScreenAComponents.DONATION" option="donation" />
        <template v-if="screenOptions.squeezeBackSize == 'normal'">
            <Field name="showDonationSide" inline type="boolean" />
            <field name="hideSidebar" inline type="boolean" />
            <Field name="karaokeMode" inline type="boolean" />
        </template>
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
import BukGames from '../Components/BukGames'
import DefaultText from '../Components/DefaultText'
export default {
    components: {
        Actions,
        Information,
        Question,
        Donation,
        BukGames,
        DefaultText,
    },
    props: ['screen'],
    data: function() {
        return {
            screenOptions: {
                component: null,
                background: null,
                showBackground: null,
                squeezeBackSize: null,
                showDonationSide: null,
                hideSidebar: false,
                karaokeMode: null,
                defaultText: {
                    defaultText: null,
                },
                information: {
                    information: null
                },
                donation: {
                    showResults: false,
                    size: null,
                    ...this.screen.options.donation
                },
                wwr: {
                    autoSpin: null,
                    selectedContinent: null,
                    selectedMarker: null,
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
        ...mapModels(['ScreenAComponents'])
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
