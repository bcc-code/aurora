<template>
    <Form :entity="screenOptions" label-root="screen" grid :columns="1">
        <Field name="background" type="text" />
        <Field name="component" type="select" allowEmpty :options="ScreenMComponents" />
        <LEDQuestion v-if="screenOptions.component == ScreenMComponents.QUESTION" option="question" />
        <WorldMap v-else-if="screenOptions.component == ScreenMComponents.WORLDMAP" option="worldMap" />
        <NeedRefresh v-if="screen.needRefresh" />
        <Actions canRefresh :canSave="hasChanged" @apply="apply" @refresh="refresh"/>
    </Form>
</template>

<script>
import { mapModels } from '@/mixins/mapModels';
import { mapActions, mapState } from 'vuex'
import Actions from '../Actions'
import NeedRefresh from '../NeedRefresh'
import ScreenManager from '@/mixins/ScreenManager.js'
import LEDQuestion from '../Components/LEDQuestion'
import WorldMap from '../Components/WorldMap'
export default {
    components: {
        Actions,
        NeedRefresh,
        LEDQuestion,
        WorldMap
    },
    props: ['screen'],
    data: function() {
        return {
            screenOptions: {
                background: null,
                showBackground: true,
                component: null,
                worldMap: {
                    mapUrl: null,
                    worldPart: null,
                    showCheckinsNumber: null,
                    markesColor: null
                },
                question: {
                    question: null,
                    view: null,
                    viewType: null,
                    finished: null,
                }
            }
        }
    },
    mixins: [ScreenManager],
    computed: {
        ...mapModels(['ScreenMComponents']),
    },
    methods: {
        ...mapActions('questions', ['bindQuestionsRef']),
    },
    async mounted(){
        await this.bindQuestionsRef();
    },
}
</script>