<template>
    <OneColumn>
        <div class="w-full flex justify-between">
            <Title>{{$t('menu.events')}}</Title>
            <router-link :to="{ name: 'templates' }" class="text-base self-end">Browse templates</router-link>
        </div>
        <List :elements="filteredEvents" :multiLang="false" @sorted="onSorted">
            <template v-slot:header>
                <Tabs class="mb-3" :tabs="tabs" :selected="selectedTab" @select="(tab) => selectedTab = tab" />
            </template>
            <template v-slot:list="{ elements, searchQuery }">
                <Event v-for="event in elements" :key="event.id" :event="event" :searchQuery="searchQuery"/>
            </template>
            <template v-slot:newElement="{ nextOrder }">
                <NewElement v-if="$can('create', 'event')" :order="nextOrder" @add="addEventHandler" />
            </template>
        </List>
    </OneColumn>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Event from '@/components/List/Elements/Event.vue'
import NewElement from '@/components/List/NewElement.vue'
import List from '@/components/List/List.vue'
import Tabs from '@/components/Tabs'
import { NewEvent, NewScreen} from '@/data/event'
export default {
    components: {
        List,
        Event,
        NewElement,
        Tabs
    },
    data: function () {
        return {
            tabs: ['upcoming', 'archive'],
            selectedTab: 'upcoming'
        }
    },
    computed: {
        ...mapState('events', ['events']),
        filteredEvents() {
            return this.events.filter((event) => event.archived == (this.selectedTab == 'archive'))
        }
    },
    created: async function(){
        this.$store.commit('events/setSelectedEventId', null);
        this.$store.commit('templates/setSelectedTemplateId', null);
        await this.bindEvents();
    },
    methods: {
        ...mapActions('events', ['bindEvents', 'addEvent', 'updateBatchEvents']),
        ...mapActions('screens', ['createScreen']),
        ...mapActions('gameboard', ['initGameboard']),
        async addEventHandler(newEvent){
            var event = NewEvent(newEvent.text, newEvent.order)
            var screens = ["L", "M", "R", "E", "E2", "A", "F"].map((id, index) => NewScreen(id, index));
            await this.addEvent(event)
                .then(async (eventId) => {
                    await this.initGameboard(eventId)
                    await Promise.all(screens.map(screen => this.createScreen({ eventId: eventId, screen: screen })));
                    this.showSuccess('messages.event-created');
                })
                .catch(this.showError)
        },
        async onSorted(sortedEvents){
            await this.updateBatchEvents(sortedEvents);
        },
        
    }
}
</script>