<template>
    <li class="mb-2">
        <div class="list-item" :class="[isLive ? 'bg-green-500' : 'bg-background-2']">
            <div class="list-item-order handle">{{programElement.order}}</div>
            <div class="flex-1 pl-1 mr-16">
                <div class="font-medium"  v-html="text"></div>
                <div class="text-gray-600 text-sm">{{ProgramElementTypeLabel[programElement.type]}}</div>
            </div>
            <div v-if="$can('update', programElement)" class="overlay">
                <button v-if="!isLive" class="btn btn-green" @click.stop="setAsCurrent">{{$t('queue.push')}}</button>
                <span class="btn btn-delete" @click.stop="removeProgramElement"><i class="fa fa-times"></i></span>
            </div>
        </div>
    </li>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ProgramElementTypeLabel } from '@/models/program.js'
import Translations from '@/mixins/translation.js'
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
            await this.setAsCurrentRef(this.programElement.id);
        },
    }
}
</script>