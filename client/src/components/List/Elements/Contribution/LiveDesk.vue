<template>
    <li class="mb-2" v-click-outside="() => editMode = false" @click.stop="editMode = true">
        <div class=" list-item bg-downy">
            <template v-if="!editMode">
                <template>
                    <section class="w-full">
                        <p class="text-grey-100 elType">{{ContributionTypesLabels[element.type]}}</p>
                        <p class="text-white font-medium text-base w-full">{{element.content}}</p>
                        <div class="text-grey-100 text-sm mb-2">{{element.author}}</div>
                        <div class="text-grey-100 text-sm mb-2">{{date(element.date)}}</div>
                    </section>
                    <section class="overlay h-full">
                        <button class="h-10 mt-3 btn bg-bluewood" @click="withdrawElement">{{$t('queue.withdraw')}}</button>
                    </section>
                </template>
            </template>
            <section v-else class="w-full flex flex-wrap justify-end">
                <template>
                    <p class="text-grey-100 elType">{{ContributionTypesLabels[element.type]}}</p>
                    <BibleVerse v-model="editableElement" />
                </template>
                <button class="btn bg-bluewood" :class="{'disabled': isNotCompleted}" @click="updateElement">{{$t('actions.save')}}</button>
            </section>
        </div>
    </li>
</template>

<script>
import { mapActions } from 'vuex'

import { ContributionTypes, ContributionTypesLabels } from '@/models/contribution.js'
import DateHelper from '@/mixins/date.js'
import ClickOutside from 'vue-click-outside'
import BibleVerse from '@/components/Forms/BibleVerse.vue'
export default {
    components: { BibleVerse },
    props: {
        element: {
            type: Object,
            required: true
        },
    },
    data: function(){
        return {
            editMode: false,
            editableElement: this.element,
        }
    },
    computed: {
        ContributionTypes(){
            return ContributionTypes;
        },
        ContributionTypesLabels(){
            return ContributionTypesLabels;
        },
        isCompleted(){
            if (this.editableElement.type == ContributionTypes.BIBLEVERSE && this.editableElement.author == "") {
                return false;
            }

            return this.editableElement.content && this.editableElement.content.length > 0;

        },
        isNotCompleted(){
            return !this.isCompleted
        }
    },
    mixins: [DateHelper],
    methods: {
        ...mapActions('contributions', ['updateLiveVerse', 'withdrawLiveVerse', 'removeWasLive']),

        async withdrawElement(){
            await this.removeWasLive(this.element.id)
            await this.withdrawLiveVerse(this.element);
        },
        async updateElement(){
            if (this.isCompleted) {
                this.editableElement.publishedDate = Date.now();
                await this.updateLiveVerse(this.editableElement);
                this.editMode = false
            }
        },
        getProperty(property){
            return (property == null) ? null : property;
        }
    },
    directives: {
        ClickOutside
    }
}
</script>
<style scoped>
.elType {
   font-style: italic;
   font-size: 13px;
   text-align: right;
}
</style>
