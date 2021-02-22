<template>
	<div class="w-full mt-8">
        <template v-if="!loaded" />
        <List v-else :elements="filteredContributions" :multiLang="false" revert>
            <template v-slot:list="{ elements, searchQuery }">
                <ApprovalEntry v-for="entry in elements" :key="entry.id" :entry="entry" :searchQuery="searchQuery"/>
            </template>
        </List>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ApprovalEntry from '@/components/List/Elements/Contribution/ApprovalEntry.vue'
import List from '@/components/List/List.vue'

export default {
    data: function(){
        return {
            loaded: false
        }
    },
    components: {
        List,
        ApprovalEntry
    },
    computed: {
        ...mapState('contributions', ['contributions']),
        filteredContributions(){
            return this.contributions.filter((contribution) => contribution.tags == null || contribution.tags.indexOf('rejected') < 0);
        }
    },
    async mounted(){
        await this.bindContributionsRef();
        this.loaded = true;
    },
    methods: {
        ...mapActions('contributions', ['bindContributionsRef']),
    },
}
</script>