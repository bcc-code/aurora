<template>
    <li class="mb-2" v-click-outside="() => editMode = false" @click.stop="editMode = true">
        <div class=" list-item bg-downy">
            <template v-if="!editMode">
                <template>
                    <section class="w-full">
                        <p class="text-gray-100 elType">{{ContributionTypesLabels[element.type]}}</p>
                        <p class="text-white font-medium text-base w-full ">{{element.content}}</p>
                        <div class="text-gray-100 text-sm mb-2">{{element.author}}</div>
                        <div class="text-gray-100 text-sm mb-2">{{date(element.date)}}</div>
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

                <button class="btn bg-bluewood mr-1" :class="{'disabled': isNotCompleted}" @click.stop="showExtendConfirm1 = true">+1</button>
                <button class="btn bg-bluewood mx-1" :class="{'disabled': isNotCompleted}" @click.stop="showExtendConfirm2 = true">+2</button>
                <button class="btn bg-bluewood mx-1" :class="{'disabled': isNotCompleted}" @click.stop="showExtendConfirm3 = true">+3</button>
                <button class="btn bg-bluewood mx-1" :class="{'disabled': isNotCompleted}" @click.stop="showExtendConfirm4 = true">+4</button>

                <button class="btn bg-bluewood ml-1" :class="{'disabled': isNotCompleted}" @click="updateElement">{{$t('actions.save')}}</button>
            </section>
        </div>
        <Confirm v-if="mediabank-webhook-passwordshowExtendConfirm1" @cancel="showExtendConfirm1 = false" @confirm="extendVerse(1)" :message="$t('dialogs.confirm-extend-verse-1')" />
        <Confirm v-if="showExtendConfirm2" @cancel="showExtendConfirm2 = false" @confirm="extendVerse(2)" :message="$t('dialogs.confirm-extend-verse-2')" />
        <Confirm v-if="showExtendConfirm3" @cancel="showExtendConfirm3 = false" @confirm="extendVerse(3)" :message="$t('dialogs.confirm-extend-verse-3')" />
        <Confirm v-if="showExtendConfirm4" @cancel="showExtendConfirm4 = false" @confirm="extendVerse(4)" :message="$t('dialogs.confirm-extend-verse-4')" />
    </li>
</template>

<script>
import { mapActions } from 'vuex'

import { ContributionTypes, ContributionTypesLabels } from '@/models/contribution.js'
import DateHelper from '@/mixins/date.js'
import ClickOutside from 'vue-click-outside'
import BibleVerse from '@/components/Forms/BibleVerse.vue'
import Confirm from '@/components/Dialogs/Confirm.vue'
export default {
    components: { BibleVerse, Confirm },
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
            showExtendConfirm1: false,
            showExtendConfirm2: false,
            showExtendConfirm3: false,
            showExtendConfirm4: false,
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
        ...mapActions('contributions', ['updateLiveVerse', 'withdrawLiveVerse']),

        async withdrawElement(){
            await this.withdrawLiveVerse(this.element);
        },
        async updateElement(){
            if (this.isCompleted) {
                this.editableElement.publishedDate = Date.now();
                await this.updateLiveVerse(this.editableElement);
                this.editMode = false
            }
        },
        async extendVerse(extendBy){
            if(this.editableElement.verse.verse_to == undefined) {
                this.editableElement.verse.verse_to = this.editableElement.verse.verse_from
                this.editableElement.verse.verse_to = this.editableElement.verse.verse_to + extendBy
            } else {
                this.editableElement.verse.verse_to = this.editableElement.verse.verse_to + extendBy
            }
            this.editableElement.publishedDate = Date.now();
            await this.updateLiveVerse(this.editableElement);
            this.editMode = false
            this.showExtendConfirm1 = false
            this.showExtendConfirm2 = false
            this.showExtendConfirm3 = false
            this.showExtendConfirm4 = false
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
