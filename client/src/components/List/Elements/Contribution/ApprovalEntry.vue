<template>
    <Contribution :entry="entry" :searchQuery="searchQuery" :enableLightbox="true">
        <template v-slot:default>
            <div class="flex justify-evenly text-2xl px-6 py-2">
                <button type="button" @click.stop="approveContribution"><i class="fas fa-thumbs-up text-downy"></i></button>
                <button type="button" @click.stop="rejectContribution"><i class="fas fa-trash-alt text-cerise"></i></button>
            </div>
        </template>
    </Contribution>
</template>

<script>
import { mapActions } from 'vuex'
import Contribution from './Contribution.vue'
export default {
    components: {
        Contribution
    },
    props: {
        entry: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    methods: {
        ...mapActions('contributions', ['approveContributionRef', 'rejectContributionRef']),
        async approveContribution(){
            this.entry.approvedDate = Date.now();
            await this.approveContributionRef(this.entry)
        },
        async rejectContribution(){
            await this.rejectContributionRef(this.entry)
        },
        highlight(text){
            return (this.searchQuery && this.searchQuery.trim()) 
                ? text.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-seagull rounded-sm'>\$1</span>") 
                : text;
        }
    }
}
</script>