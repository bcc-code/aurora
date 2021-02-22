<template>
	<div class="w-full mt-8">
        <template v-if="loaded">
            <div v-if="selectedEvent.automaticFeed" class=" border-l-4 text-white p-4 mb-3" role="alert"
                :class="pusherId == selectedEvent.automaticFeedPusherId ? 'bg-blue-600  border-blue-900' : 'bg-gray-600 border-gray-700'">
                <p class="font-bold text-sm">{{$t('queue.notice')}}</p>
                <p class="text-sm">{{$t('queue.automatic-feed-activated', { frequency: automaticFeedFrequency })}}</p>
            </div>
            <List :elements="filteredQueue" :multiLang="false" revert> 
                <section slot="header">
                    <div class="w-full flex flex-wrap justify-between mb-3 align-items-baseline">
                        <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                            <label class="form-label">{{$t('event.automaticFeedFrequency')}}</label>
                            <input class="form-input" type="number" v-model="automaticFeedFrequency">
                        </div>
                        <div class="w-full md:w-2/3 px-3 mb-6 md:mb-0 text-right self-end">
                            <button class="btn" :class="automaticFeed ? 'btn-red': 'btn-green'" @click="toggleAutomaticFeed">{{automaticFeed ? $t('feed.stop-auto-push') : $t('event.automaticFeed')}}</button>
                        </div>
                    </div>
                    <div class="w-full flex justify-between mb-3 align-items-baseline">
                        <span class="tracking-wide text-md px-4 mb-3">{{$t('queue.number-selected', { number : selectedElements.length })}}</span>
                        <span class="tracking-wide text-md px-4 mb-3">{{$t('queue.number-elements', { number : filteredQueue.length })}}</span>
                        <button class="btn btn-green" :class="{'disabled': selectedElements.length == 0}" @click="sendToFeed">{{$t('queue.push')}}</button>
                    </div>
                    <div class="bg-background-2 mb-3">
                        <nav class="flex flex-col sm:flex-row">
                            <button v-for="tab in tabs" :key="tab" class="w-1/2 py-4 px-6 block hover:text-tint-1 focus:outline-none"
                                :class="selectedTab == tab ? 'text-tint-1 border-b-2 font-medium border-tint-1' : 'text-white'"
                                @click="selectedTab = tab">
                                {{$t(`queue.tabs.${tab}`)}}
                            </button>
                        </nav>
                    </div>
                </section>
                <template v-slot:list="{ elements, searchQuery }">
                    <Contribution v-for="element in elements" 
                        :key="element.id" 
                        :entry="element" 
                        :searchQuery="searchQuery" 
                        :selected="selectedElements.some((el) => el.id == element.id)" 
                        @select="selectElement"
                        @deselect="deselectElement">
                        <template v-slot:default>
                            <div class="flex justify-evenly text-2xl px-6 py-2">
                                <button type="button" @click.stop="removeQueueElement(element.id)"><i class="fas fa-trash-alt text-red-500"></i></button>
                            </div>
                        </template>
                    </Contribution>
                </template>
                <template v-slot:newElement></template>
            </List>
        </template>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import List from '@/components/List/List.vue'
import Contribution from '@/components/List/Elements/Contribution/Contribution.vue'
export default {
    data: function(){
        return {
            loaded: false,
            selectedElements: [],
            automaticFeedFrequency: null,
            automaticFeed: null,
            pusherId: Math.random().toString(36).slice(-5),
            pusherTimeout: null,
            tabs: ['all', 'pictures', 'testimonies'],
            selectedTab: 'all'
        }
    },
    components: {
        List,
        Contribution
    },
    watch: {
        automaticFeedFrequency: {
            immediate: false,
            async handler(val) {
                if (parseInt(val) >= 1) {
                    var options = {
                        id: this.selectedEvent.id,
                        values: {automaticFeedFrequency: val }
                    };
                    await this.patchEventRef(options);
                }
            }
        },
    },
    computed: {
        ...mapState('contributions', ['queue']),
        ...mapGetters('events', ['selectedEvent']),
        filteredQueue() {
            switch (this.selectedTab) {
                case 'pictures':
                    return this.queue.filter((el) => 
                        el.imageUrl && el.imageUrl.length > 0
                        && (!el.text || el.text == ''))
                case 'testimonies': 
                    return this.queue.filter((el) =>
                        el.text && el.text.length > 0)
                default:
                    return this.queue
            }
        }
    },
    async mounted(){
        await this.bindQueueRef();
        this.automaticFeed = this.selectedEvent.automaticFeed;
        this.automaticFeedFrequency = this.selectedEvent.automaticFeedFrequency;
        this.loaded = true;
    },
    methods: {
        ...mapActions('contributions', ['bindQueueRef', 'sendToFeedRef', 'removeQueueElementRef']),
        ...mapActions('events', ['patchEventRef']),
        selectElement(element) {
            if (!this.automaticFeed)
                this.selectedElements.push(element);
        },
        deselectElement(element) {
            var index = this.selectedElements.findIndex(el => el.id == element.id);
            this.selectedElements.splice(index, 1);
        },
        async sendToFeed(){
            if (this.selectedElements.length > 0) {
                await Promise.all(this.selectedElements.map(this.sendContributionToFeed));
                this.selectedElements = []
            }
        },
        async sendContributionToFeed(entry, index = 0) {
            entry.publishedDate = Date.now() + index * 100;
            await this.sendToFeedRef(entry)
        },
        async removeQueueElement(entryId){
            await this.removeQueueElementRef(entryId)
        },
        async autoPush() {
            if (this.automaticFeed) {
                if (this.filteredQueue && this.filteredQueue.length > 0) {
                    var elementToPush = this.filteredQueue.sort((a,b) => a.approvedDate - b.approvedDate)[0];
                    /* Calculate time to display the element */
                    var textLength = (elementToPush.text && elementToPush.text.length) || 0;
                    var timeToShow = Math.max((textLength / 1000) * 60, this.automaticFeedFrequency) * 1000;
                    clearTimeout(this.pusherTimeout);
                    this.pusherTimeout = setTimeout(this.autoPush, timeToShow);
                    await this.sendContributionToFeed(elementToPush);
                }
            }
            else clearTimeout(this.pusherTimeout);
        },
        async toggleAutomaticFeed () {
            this.automaticFeed = !this.automaticFeed
            var options = {
                id: this.selectedEvent.id,
                values: {
                    automaticFeed: this.automaticFeed,
                    automaticFeedPusherId: this.automaticFeed ? this.pusherId : null
                }
            };
            await this.patchEventRef(options);
            if (this.selectedEvent.automaticFeedPusherId == this.pusherId)
                this.autoPush();
            else
                clearTimeout(this.pusherTimeout);
        }
    },
}
</script>