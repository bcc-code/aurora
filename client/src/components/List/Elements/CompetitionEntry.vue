<template>
    <li class="mb-2 xl:w-1/4 lg:w-1/3 md:w-1/2 w-full px-4">
        <div class="cursor-pointer transition duration-500 p-0 rounded relative bg-mirage">
            <div class="px-4 py-3 flex flex-wrap">
                <div class="font-semibold tracking-wide mb-2 w-3/4" v-html="highlight(firstAndLastName)"></div>
                <div class="text-label-2 text-sm mb-2 w-1/4 text-right" v-html="highlight(entry.user == null ? '' : entry.user.churchName)"></div>
                <div class="text-label-2 font-semibold tracking-wide mb-2 w-full">{{$t('competition.totalDistance')}}: {{entry.distanceToBeApproved + entry.distance}} kms</div>
                <div class="text-label-2 text-sm mb-2 w-full">{{$t('competition.extraToApprove')}}: {{entry.distanceToBeApproved}} kms</div>
            </div>
            <div class="flex justify-evenly text-2xl px-6 py-2">
                <button type="button" @click.stop="approve"><i class="fas fa-thumbs-up text-downy"></i></button>
                <button type="button" @click.stop="reject"><i class="fas fa-trash-alt text-cerise"></i></button>
            </div>
        </div>
    </li>
</template>

<script>
import { mapActions } from 'vuex'
import Api from '@/utils/api.js'
export default {
    props: {
        entry: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        },
        competitionId: {
            type: String,
            default: ''
        }
    },
    computed: {
        firstAndLastName(){
            return this.entry.user == null ? '' : `${this.entry.user.FirstName} ${this.entry.user.LastName}`;
        }
    },
    methods: {
        ...mapActions('competitions', ['approveEntrynRef', 'rejectEntryRef']),
        async approve(){
            await Api.approveCompetitionEntry(this.competitionId, this.entry.user.personId, this.entry.distanceToBeApproved + this.entry.distance);
        },
        async reject(){
            await this.rejectEntryRef(this.entry)
        },
        highlight(text){
            return (this.searchQuery && this.searchQuery.trim())
                ? text.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-seagull rounded-sm'>\$1</span>")
                : text;
        }
    }
}
</script>
