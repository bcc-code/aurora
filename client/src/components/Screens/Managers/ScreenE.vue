<template>
    <Form :entity="screenOptions" label-root="screen" grid :columns="1">
        <Field name="background" type="text" />
        <Field name="component" type="select" allowEmpty :options="ScreenEComponents" />
        <LEDQuestion v-if="screenOptions.component == ScreenEComponents.QUESTION" option="question" />
        <WorldMap v-else-if="screenOptions.component == ScreenEComponents.WORLDMAP" option="worldMap" />
        <FeedPictures v-else-if="screenOptions.component == ScreenEComponents.FEEDPICTURES" option="feedPictures" />
        <BukGames v-else-if="screenOptions.component == ScreenEComponents.BUKGAMES" option="bukGames" />
        <WWR v-else-if="screenOptions.component == ScreenEComponents.WWR" option="wwr" />
        <DonationList v-else-if="screenOptions.component == ScreenEComponents.DonationList" option="" />
        <NeedRefresh v-if="screen.needRefresh" />
        <Actions canRefresh :canSave="hasChanged" @apply="apply" @refresh="refresh"/>
    </Form>
</template>

<script>
import { mapModels } from '@/mixins/mapModels';
import { mapActions, mapState } from 'vuex'
import NeedRefresh from '../NeedRefresh'
import Actions from '../Actions'
import ScreenManager from '@/mixins/ScreenManager.js'
import LEDQuestion from '../Components/LEDQuestion'
import WorldMap from '../Components/WorldMap'
import FeedPictures from '../Components/FeedPictures'
import BukGames from '../Components/BukGames'
import WWR from '../Components/WWR'
import DonationList from '../Components/DonationList'

export default {
    components: {
        NeedRefresh,
        Actions,
        LEDQuestion,
        WorldMap,
        FeedPictures,
        BukGames,
        WWR,
        DonationList,
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
                },
                feedPictures: {
                    view: null,
                    columns: null,
                },
                bukGames: {
                    game: null
                },
                wwr: {
                    autoSpin: null,
                    selectedChurch: null,
                    leaderboardType: null,
                    x: null,
                    y: null,
                    zoom: null
                }
            }
        }
    },
    mixins: [ScreenManager],
    computed: {
        ...mapModels(['ScreenEComponents']),
    },
    methods: {
        ...mapActions('questions', ['bindQuestionsRef']),
    },
    async mounted(){
        await this.bindQuestionsRef();
    },
}
</script>
