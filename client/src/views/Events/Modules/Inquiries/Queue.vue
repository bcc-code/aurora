<template>
	<div class="w-full mt-8">
        <template v-if="!loaded" />
        <List v-else :elements="queue" :sortNullToBottom="true" :multiLang="false" :searchable="false" :unifiedSearchQuery="$parent.searchQuery" @sorted="onSorted">
            <template v-slot:list="{ elements, searchQuery }">
                <Inquiry v-for="inquiry in elements" :key="inquiry.id" :inquiry="inquiry" :searchQuery="searchQuery" inQueue/>
            </template>
        </List>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Inquiry from '@/components/List/Elements/Inquiry.vue'
import List from '@/components/List/List.vue'

export default {
    components: {
        List,
        Inquiry
    },
    data: function(){
        return {
            loaded: false
        }
    },
    computed: {
        ...mapState('inquiries', ['queue']),
    },
    async mounted(){
        await this.bindInquiriesQueue();
        this.loaded = true;
    },
    methods: {
        ...mapActions('inquiries', ['bindInquiriesQueue', 'updateBatchInquiries']),
        async onSorted(sortedInquiries){
            await this.updateBatchInquiries(sortedInquiries);
        }
    },
}
</script>
