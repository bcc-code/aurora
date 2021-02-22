<template>
	<div class="w-full mt-8">
        <div class="w-full pt-8 px-3 mb-6 md:mb-3">
            <toggle-button sync v-model="canSendInquiries" />
            <span class="ml-5 uppercase tracking-wide text-sm">{{$t('event.canSendInquiries')}}</span>
        </div>
        <template v-if="!loaded" />
        <List v-else :elements="inquiries" :multiLang="false">
            <template v-slot:list="{ elements, searchQuery }">
                <Inquiry v-for="inquiry in elements" :key="inquiry.id" :inquiry="inquiry" :searchQuery="searchQuery"/>
            </template>
        </List>
	</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Inquiry from '@/components/List/Elements/Inquiry.vue'
import List from '@/components/List/List.vue'

export default {
    components: {
        List,
        Inquiry
    },
    data: function(){
        return {
            loaded: false,
            canSendInquiries: null,
        }
    },
    computed: {
        ...mapState('inquiries', ['inquiries']),
        ...mapGetters('events', ['currentEvent']),
    },
    async mounted(){
        await this.bindInquiriesRef();
        this.loaded = true;
    },
    methods: {
        ...mapActions('inquiries', ['bindInquiriesRef', 'toggleSendInquiriesFlag']),
    },
    watch: {
        'currentEvent.id': {
            immediate: true,
            deep: true,
            handler(val) {
                this.canSendInquiries = this.currentEvent.canSendInquiries;
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