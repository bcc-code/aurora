<template>
    <li class="mb-2">
        <div class="list-item" :class="[isLive ? 'bg-downy' : 'bg-mirage']">
            <div class="list-item-order handle">{{programElement.order}}</div>
            <div class="flex-1 pl-1 mr-16">
                <div class="font-medium"  v-html="text"></div>
                <div class="text-gray-600 text-sm">{{ProgramElementTypeLabel[programElement.type]}}</div>
            </div>
            <div v-if="$can('update', programElement)" class="overlay">
                <button v-if="!isLive" class="btn btn-green" @click.stop="setAsCurrent">{{$t('queue.push')}}</button>
                <button v-if="programElement.start && programElement.end" class="btn btn-blue" @click.stop="pushToMB">Push to MB</button>
                <span class="btn btn-delete" @click.stop="removeProgramElement"><i class="fa fa-times"></i></span>
            </div>
        </div>
    </li>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ProgramElementTypeLabel } from '@/models/program.js'
import Translations from '@/mixins/translation.js'
import api from '@/utils/api.js'

export default {
    props: {
        programElement: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    mixins: [Translations],
    computed: {
        ...mapGetters('program', ['currentProgramElement']),
        ...mapGetters('events', ['selectedEventRef']),
        text() {
            var text = this.inLanguage(this.programElement, this.language);
            return (this.searchQuery && this.searchQuery.trim())
                ? text.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='highlight'>\$1</span>")
                : text;
        },
        isLive() {
            return this.currentProgramElement != null && this.currentProgramElement.id == this.programElement.id;
        },
        ProgramElementTypeLabel(){
            return ProgramElementTypeLabel;
        }
    },
    methods: {
        ...mapActions('program', ['removeProgramElementRef', 'setAsCurrentRef']),
        async removeProgramElement(){
            if (this.isLive) await this.setAsCurrentRef(null);
            await this.removeProgramElementRef(this.programElement.id);
        },
        async setAsCurrent(){
            await this.setAsCurrentRef(this.programElement);
        },
        async pushToMB(){
            let event = await this.selectedEventRef.get()
            if (!event.data().mediabankID) {
                // Missing mediabankID. Can't proceed
                return
            }

            await api.createSubclip(event.data().mediabankID, this.programElement.text, "91000", "92001") //TODO in out times
        },
    }
}
</script>
