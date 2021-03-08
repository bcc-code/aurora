<template>
    <li class="mb-2" v-click-outside="() => editMode = false" @click.stop="editMode = true">
        <div class=" list-item bg-background-2">
            <template v-if="!editMode">
                <section class="w-full">
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
            <section v-else class="w-full flex flex-wrap justify-end">
                <template v-if="element.type == ContributionTypes.QUOTE  || ContributionTypes.BIBLEVERSE">
                    <textarea rows="3" class="form-input mb-2" v-model="elementContent" placeholder="Quote" />
                    <input type="text" class="form-input mb-2" v-model="elementAuthor" placeholder="Author" />
                    <input type="text" class="form-input mb-2" v-model="elementSource" placeholder="Source" />
                </template>
                <template v-else>
                    <textarea rows="3" class="form-input mb-2" v-model="elementContent" placeholder="Information" />
                </template>
                <button class="btn btn-green" :class="{'disabled': isNotCompleted}" @click="updateElement">{{$t('actions.save')}}</button>
            </section>
        </div>
    </li>
</template>

<script>
import { mapActions } from 'vuex'

import { ContributionTypes } from '@/models/contribution.js'
import DateHelper from '@/mixins/date.js'
import ClickOutside from 'vue-click-outside'
export default {
    props: {
        element: {
            type: Object,
            required: true
        },
    },
    data: function(){
        return {
            editMode: false,
            elementSource: this.element.source,
            elementAuthor: this.element.author,
            elementContent: this.element.content
        }
    },
    computed: {
        ContributionTypes(){
            return ContributionTypes;
        },
        isNotCompleted(){
            return this.elementContent == null || this.elementContent.length == 0;
        }
    },
    mixins: [DateHelper],
    methods: {
        ...mapActions('contributions', ['updateDeskElement', 'removeDeskElement', 'sendDeskToFeed']),
        async removeElement(){
            await this.removeDeskElementRef(this.element.id);
        },
        async pushElement(){
            var computedElement = this.element;
            computedElement.publishedDate = Date.now();
            await this.sendDeskToFeedRef(computedElement)
        },
        async updateElement(){
            if (!this.isNotCompleted) {
                var computedElement = this.element;
                computedElement.author = this.getProperty(this.elementAuthor);
                computedElement.source = this.getProperty(this.elementSource);
                computedElement.content = this.getProperty(this.elementContent);
                await this.updateDeskElementRef(computedElement);
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