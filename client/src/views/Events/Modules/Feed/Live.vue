<template>
	<div class="w-full mt-8">
        <template v-if="!loaded" />
        <List v-else :elements="feed" :searchable="false" :unifiedSearchQuery="$parent.searchQuery" :multiLang="false" revert>
            <template v-slot:list="{ elements, searchQuery }">
                <p class="text-center w-full text-gray-400" v-if="feed.length == 0">There is nothing in the Live Feed</p>
                <ApprovalEntry v-for="entry in elements" :key="entry.id" :entry="entry" :searchQuery="searchQuery"/>
            </template>
        </List>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ApprovalEntry from '@/components/List/Elements/Contribution/LiveEntry.vue'
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
        ...mapState('contributions', ['feed']),
    },
    async mounted(){
        await this.bindLiveRef();
        this.loaded = true;
    },
    methods: {
        ...mapActions('contributions', ['bindLiveRef']),
    },
}
</script>