<template>
	<div class="w-full mt-8">
        <template v-if="!loaded" />
        <List v-else :elements="inquiries" :multiLang="false" :searchable="false" :unifiedSearchQuery="$parent.searchQuery">
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
        }
    },
    computed: {
        ...mapState('inquiries', ['inquiries']),
    },
    async mounted(){
        await this.bindInquiries();
        this.loaded = true;
    },
    methods: {
        ...mapActions('inquiries', ['bindInquiries']),
    },
    
}
</script>