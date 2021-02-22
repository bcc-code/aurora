<template>
	<div class="w-full mt-8">
        <template v-if="!loaded" />
        <template v-else>
            <div class="bg-mirage p-4 rounded-lg">
                <Form :entity="current" grid :columns="2" label-root="competition">
                    <Field name="competition" type="select" allowEmpty :options="competitions" select-label="id" />
                    <Field name="active" type="boolean" inline />
                </Form>
                <Form v-if="current.competition && current.competition.id" :entity="current.competition" grid :columns="2" label-root="competition">
                    <Field name="maxDistancePerEntry" label="competition.maxDistancePerEntry" type="number" />
                    <Field name="selectedContinent" label="competition.highlightedContinent" allowEmpty type="select" :options="Continents" />
                    <Field name="selectedMarker" label="competition.markerInFocus" allowEmpty type="select" :options="Markers" />
                    <div class="mt-4 md:flex md:items-center md:justify-between">
                        <button class="btn btn-green" type="button"
                            @click="updateCompetition">
                            {{$t('actions.save')}}
                        </button>
                    </div>
                </Form>
            </div>
            <template v-if="competition != null">
                <List :elements="entriesToApprove" :multiLang="false" revert>
                    <template v-slot:list="{ elements, searchQuery }">
                        <p class="text-gray-400 text-center w-full" v-if="elements.length == 0">There is no entry to approve</p>
                        <CompetitionEntry v-for="entry in elements" :key="entry.id" :entry="entry" :searchQuery="searchQuery" :competitionId="competition.id"/>
                    </template>
                </List>
            </template>
        </template>
	</div>
</template>


<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import List from '@/components/List/List.vue'
import CompetitionEntry from '@/components/List/Elements/CompetitionEntry.vue'
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
import { mapModels } from '@/mixins/mapModels';
export default {
    data: function(){
        return {
            loaded: false,
            current: {
                competition: {
                    maxDistancePerEntry: null,
                    selectedContinent: null,
                    selectedMarker: null
                },
                active: null
            }
        }
    },
    components: {
        List,
        CompetitionEntry
    },
    computed: {
        ...mapState('competitions', ['competitions', 'entriesToApprove']),
        ...mapGetters('competitions', ['competition']),
         ...mapModels(['Continents', 'Markers']),
    },
    mounted: async function(){
        if (this.competition != null)
            await this.bindEntriesToApproveRef();
        this.resetValues();
        this.loaded = true;
    },
    methods: {
        ...mapActions('competitions', ['bindEntriesToApproveRef', 'updateCompetitionRef', 'stopCompetitionRef', 'startCompetitionRef']),
        resetValues() {
            this.current.competition = this.competition;
            this.current.active = this.competition != null
        },
        async updateCompetition() {
            try {
                delete this.current.competition.totalDistance;
                delete this.current.competition.totalDistanceToApprove;
                this.current.competition.maxDistancePerEntry = parseInt(this.current.competition.maxDistancePerEntry );
                await this.updateCompetitionRef(this.current.competition)
                if (this.current.active) {
                    await this.startCompetitionRef(this.current.competition.id);
                    await this.bindEntriesToApproveRef();
                }
                else await this.stopCompetitionRef()
                this.resetValues();
                this.showSuccess()
            }
            catch {
                this.showError()
            }
        }
    },
}
</script>