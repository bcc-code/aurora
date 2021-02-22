<template>
    <section class="space-y-5">
        <Title>Inquiries</Title>
        <div class="w-full pt-8 px-3 mb-6 md:mb-3">
            <toggle-button sync v-model="canSendInquiries" />
            <span class="ml-5 uppercase tracking-wide text-sm">{{$t('event.canSendInquiries')}}</span>
        </div>
        <div class="w-full flex flex-wrap lg:flex-nowrap gap-y-3 justify-between">
            <Tabs :tabs="tabs" :selected="selectedTab" @select="(tab) => selectedTab = tab" />
            <input type="search" name="serch" placeholder="Search" v-model="searchQuery" class="bg-background-2 h-10 px-5 pr-10 rounded-full w-full focus:outline-none">
        </div>
        <transition name="fade" mode="out-in">
            <Incoming v-if="selectedTab == 'approval'" />
            <Queue v-else-if="selectedTab == 'queue'" />
        </transition>
    </section>
</template>
<script>
import Tabs from '@/components/Tabs'
import Incoming from './Incoming'
import Queue from './Queue'
import { mapGetters, mapActions } from 'vuex'
export default {
    components: {
        Tabs,
        Incoming,
        Queue
    },
    data: function () {
        return {
            tabs: ['approval', 'queue'],
            selectedTab: 'approval',
            searchQuery: '',
            canSendInquiries: null,
        }
    },
    computed: {
        ...mapGetters('events', ['selectedEvent']),
    },
    methods: {
        ...mapActions('inquiries', ['toggleSendInquiriesFlag'])
    },
    watch: {
        'selectedEvent.id': {
            immediate: true,
            deep: true,
            handler(val) {
                this.canSendInquiries = this.selectedEvent.canSendInquiries;
            }
        },
        canSendInquiries: {
            immediate: false,
            async handler(value, oldValue) {
                if (oldValue != null && oldValue != value)
                    await this.toggleSendInquiriesFlag(value);
            }
        }
    },
}
</script>