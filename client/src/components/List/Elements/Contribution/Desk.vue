<template>
    <li class="mb-2" v-click-outside="() => editMode = false" @click.stop="editMode = true">
        <div class=" list-item bg-background-2">
            <template v-if="!editMode">
                <template v-if="element.type == ContributionTypes.BIBLEVERSE">
                    <section class="w-full">
                        <p class="elType">{{ContributionTypesLabels[element.type]}}</p>
                        <p class="text-white text-base w-full">{{element.content}}</p>
                        <div class="text-gray-500 text-sm mb-2">{{element.author}}</div>
                        <div class="text-gray-500 text-sm mb-2">{{date(element.date)}}</div>
                    </section>
                    <section class="overlay h-full">
                        <button class="h-10 mt-3 btn btn-green" @click="pushElement">{{$t('queue.push')}}</button>
                        <span class="mt-3 btn btn-delete" @click.stop="removeElement"><i class="fa fa-times"></i></span>
                    </section>
                </template>
                <template v-else >
                    <section class="w-full">
                        <p class="elType">{{ContributionTypesLabels[element.type]}}</p>
                        <p class="text-white text-base w-full">{{element.content}}</p>
                        <div class="text-gray-500 text-sm mb-2">{{element.author}}</div>
                        <div class="text-gray-500 text-sm mb-2">{{element.source}}</div>
                        <div class="text-gray-500 text-sm mb-2">{{date(element.date)}}</div>
                    </section>
                    <section class="overlay h-full">
                        <button class="h-10 mt-3 btn btn-green" @click="pushElement">{{$t('queue.push')}}</button>
                        <span class="mt-3 btn btn-delete" @click.stop="removeElement"><i class="fa fa-times"></i></span>
                    </section>
                </template>
            </template>
            <section v-else class="w-full flex flex-wrap justify-end">
                <template v-if="element.type == ContributionTypes.QUOTE">
                    <p class="elType">{{ContributionTypesLabels[element.type]}}</p>
                    <textarea rows="3" class="form-input mb-2" v-model="editableElement.content" placeholder="Quote" />
                    <input type="text" class="form-input mb-2" v-model="editableElement.author" placeholder="Author" />
                    <input type="text" class="form-input mb-2" v-model="editableElement.source" placeholder="Source" />
                </template>
                <template v-else-if="element.type == ContributionTypes.BIBLEVERSE">
                    <p class="elType">{{ContributionTypesLabels[element.type]}}</p>
                    <BibleVerse v-model="editableElement" />
                </template>
                <template v-else>
                    <textarea rows="3" class="form-input mb-2" v-model="editableElement.content" placeholder="Information" />
                </template>
                <button class="btn btn-green" :class="{'disabled': isNotCompleted}" @click="updateElement">{{$t('actions.save')}}</button>
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
        ...mapActions('contributions', ['updateDeskElementRef', 'removeDeskElementRef', 'sendDeskToFeedRef']),
        async removeElement(){
            await this.removeDeskElementRef(this.element.id);
        },
        async pushElement(){
            var computedElement = this.element;
            computedElement.publishedDate = Date.now();
            computedElement.isLive = true;
            await this.sendDeskToFeedRef(computedElement)
        },
        async updateElement(){
            if (this.isCompleted) {
                await this.updateDeskElementRef(this.editableElement);
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
   color: rgba(107, 114, 128);
   font-style: italic;
   font-size: 13px;
   text-align: right;
}
</style>
