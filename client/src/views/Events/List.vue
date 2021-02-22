<template>
    <OneColumn class="">
        <div class="w-full flex justify-between">
            <Title>{{$t('menu.events')}}</Title>
            <router-link :to="{ name: 'templates' }" class="text-base self-end">Browse templates</router-link>
        </div>
        <List :elements="events" :multiLang="false" @sorted="onSorted">
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
import { NewEvent, NewScreen} from '@/data/event'
export default {
    components: {
        List,
        Event,
        NewElement
    },
    computed: {
        ...mapState('events', ['events']),
    },
    created: async function(){
        this.$store.commit('events/setSelectedEventId', null);
        this.$store.commit('templates/setSelectedTemplateId', null);
        await this.bindEventsRef();
    },
    methods: {
        ...mapActions('events', ['addEventRef', 'updateBatchEventsRef']),
        ...mapActions('screens', ['createScreenRef']),
        ...mapActions('events', ['bindEventsRef']),
        async addEventHandler(newEvent){
            var event = NewEvent(newEvent.text, newEvent.order)
            var screens = ["L", "M", "R", "E", "E2", "A", "F"].map((id, index) => NewScreen(id, index));
            await this.addEventRef(event).then(async (eventId) => {
                await Promise.all(screens.map(screen => this.createScreenRef({ eventId: eventId, screen: screen })));
                this.showSuccess('messages.event-created');
            }).catch(this.showError)
        },
        async onSorted(sortedEvents){
            await this.updateBatchEventsRef(sortedEvents);
        },
        
    }
}
</script>