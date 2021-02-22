<template>
    <section class="space-y-5">
        <Title>Feed</Title>
        <Form class="bg-mirage rounded-lg p-6" :entity="selectedEvent" grid :columns="2" label-root="event">
            <Field name="testimonyMaxDurationSeconds" type="number" />
            <div class="flex items-end justify-end">
                <button class="btn btn-green" type="button"
                    @click="() => updateEvent(selectedEvent).then(showSuccess('messages.event-saved')).catch(showError)">
                    {{$t('actions.save')}}
                </button>
            </div>
        </Form>
        
        <div class="w-full flex flex-wrap lg:flex-nowrap gap-y-3 justify-between">
            <Tabs :tabs="tabs" :selected="selectedTab" @select="(tab) => selectedTab = tab" />
            <input type="search" name="serch" placeholder="Search" v-model="searchQuery" class="bg-background-2 h-10 px-5 pr-10 rounded-full w-full focus:outline-none">
        </div>
        <transition name="fade" mode="out-in">
            <Approval v-if="selectedTab == 'approval'" />
            <Queue v-else-if="selectedTab == 'queue'" />
        </transition>
    </section>
</template>
<script>
import Tabs from '@/components/Tabs'
import Approval from './Approval'
import Queue from './Queue'
import { mapActions, mapGetters } from 'vuex'
export default {
    components: {
        Tabs,
        Approval,
        Queue
    },
    data: function () {
        return {
            tabs: ['approval', 'queue'],
            selectedTab: 'approval',
            searchQuery: ''
        }
    },
    computed: {
        ...mapGetters('events', ['selectedEvent']),
    },
    methods: {
        ...mapActions('events', ['updateEvent'])
    }
    
}
</script>