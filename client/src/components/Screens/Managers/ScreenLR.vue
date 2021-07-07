<template>
    <Form :entity="screenOptions" label-root="screen" grid :columns="1">
        <Field name="background" type="text" />
        <Field name="component" type="select" allowEmpty :options="ScreenLRComponents" />
        <ProfilePictures v-if="screenOptions.component == ScreenLRComponents.PROFILEPICTURES" option="profilePictures" />
        <FeedPictures v-else-if="screenOptions.component == ScreenLRComponents.FEEDPICTURES" option="feedPictures" />
        <LEDQuestion v-else-if="screenOptions.component == ScreenLRComponents.QUESTION" option="question" />
        <WorldMap v-else-if="screenOptions.component == ScreenLRComponents.WORLDMAP" option="worldMap" />
        <NeedRefresh v-if="screen.needRefresh" />
        <Actions canRefresh :canSave="hasChanged" @apply="apply" @refresh="refresh" />
    </Form>
</template>

<script>
import { mapModels } from '@/mixins/mapModels';
import { mapActions, mapState } from 'vuex'
import NeedRefresh from '../NeedRefresh'
import Actions from '../Actions'
import ScreenManager from '@/mixins/ScreenManager.js'
import ProfilePictures from '../Components/ProfilePictures'
import FeedPictures from '../Components/FeedPictures'
import LEDQuestion from '../Components/LEDQuestion'
import WorldMap from '../Components/WorldMap'
export default {
    components: {
        NeedRefresh,
        Actions,
        ProfilePictures,
        FeedPictures,
        LEDQuestion,
        WorldMap,
    },
    props: ['screen'],
    data: function() {
        return {
            screenOptions: {
                background: null,
                showBackground: true,
                component: null,
                profilePictures: {
                    frequency: null
                },
                feedPictures: {
                    view: null,
                    columns: null
                },
                question: {
                    question: null
                },
                worldMap: {
                    mapUrl: null,
                    worldPart: null,
                    showCheckinsNumber: null,
                    markesColor: null
                },
            }
        }
    },
    mixins: [ScreenManager],
    computed: {
        ...mapModels(['ScreenLRComponents']),
    },
    methods: {
        ...mapActions('questions', ['bindQuestionsRef']),
    },
    async mounted(){
        await this.bindQuestionsRef();
    },
}
</script>
