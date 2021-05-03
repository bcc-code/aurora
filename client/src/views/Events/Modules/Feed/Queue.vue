<template>
	<OneColumn v-if="loaded">
        <List :elements="filteredQueue" :multiLang="false" :searchable="false" :unifiedSearchQuery="$parent.searchQuery" revert>
            <template v-slot:header>
                <div class="rounded-lg bg-mirage p-6 mb-3">
                    <div v-if="selectedEvent.feed.autoPush" class=" border-l-4 text-white p-4 mb-3" role="alert"
                        :class="pusherId == selectedEvent.feed.pusherId ? 'bg-blue-600  border-blue-900' : 'bg-gray-600 border-gray-700'">
                        <p class="font-bold text-sm">{{$t('queue.notice')}}</p>
                        <p class="text-sm">{{$t('queue.auto-push-notice')}} {{pusherId == selectedEvent.feed.pusherId ? $t('queue.pusher-notice'): ''}}</p>
                    </div>
                    <div class="w-full flex flex-wrap justify-between mb-3 align-items-baseline">
                        <div class="w-full lg:w-1/3 px-3 mb-6 md:mb-0">
                            <label class="form-label">{{$t('queue.frequency')}}</label>
                            <input class="form-input" type="number" :readonly="selectedEvent.feed.autoPush" v-model="selectedEvent.feed.frequency">
                        </div>
                        <div class="w-full lg:w-2/3 px-3 mb-6 md:mb-0 text-right self-end">
                            <button class="btn" :class="selectedEvent.feed.autoPush ? 'btn-red': 'btn-green'" @click="toggleAutoPush">{{selectedEvent.feed.autoPush ? $t('queue.stop-auto-push') : $t('queue.start-auto-push')}}</button>
                        </div>
                    </div>
                </div>

                <div class="w-full flex justify-between mb-3 align-items-baseline">
                    <span class="tracking-wide text-md px-4 mb-3">{{$t('queue.number-selected', { number : selectedElements.length })}}</span>
                    <span class="tracking-wide text-md px-4 mb-3">{{$t('queue.number-elements', { number : filteredQueue.length })}}</span>
                    <button class="btn btn-green" :class="{'disabled': selectedElements.length == 0}" @click="sendToFeed">{{$t('queue.push')}}</button>
                </div>

                <Tabs class="mb-3" :tabs="tabs" :selected="selectedTab" @select="(tab) => selectedTab = tab" />

            </template>
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
                            <button type="button" @click.stop="removeQueueElement(element.id)"><i class="fas fa-trash-alt text-cerise"></i></button>
                        </div>
                    </template>
                </Contribution>
            </template>
            <template v-slot:newElement></template>
        </List>
	</OneColumn>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import List from '@/components/List/List'
import Tabs from '@/components/Tabs'
import Contribution from '@/components/List/Elements/Contribution/Contribution'
import { crono } from 'vue-crono'
export default {
    data: function(){
        return {
            loaded: false,
            selectedElements: [],
            pusherId: Math.random().toString(36).slice(-5),
            autoPushGoal: 0,
            autoPushCounter: 0,
            tabs: ['all', 'pictures', 'testimonies'],
            selectedTab: 'all'
        }
    },
    components: {
        List,
        Contribution,
        Tabs
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
        this.loaded = true;
    },
    mixins: [crono],
    cron: {
        autoStart: false,
        time: 1000,
        method: 'autoPushHeartbeat'
    },
    methods: {
        ...mapActions('contributions', ['bindQueueRef', 'sendToFeedRef', 'removeQueueElementRef', 'updateContribsCount']),
        ...mapActions('events', ['updateEvent']),
        selectElement(element) {
            if (!this.selectedEvent.feed.autoPush)
                this.selectedElements.push(element);
        },
        deselectElement(element) {
            var index = this.selectedElements.findIndex(el => el.id == element.id);
            this.selectedElements.splice(index, 1);
        },
        async sendToFeed(){
            if (this.selectedElements.length > 0) {
                let pushPromise = Promise.all(this.selectedElements.map(this.sendContributionToFeed));
                let updateContribCountPromise = this.updateContribsCount(this.selectedElements.length);
                this.selectedElements = []
                await Promise.all([pushPromise, updateContribCountPromise]);
            }
        },
        async sendContributionToFeed(entry, index = 0) {
            entry.publishedDate = Date.now() + index * 100;
            await this.sendToFeedRef(entry)
        },
        async removeQueueElement(entryId){
            await this.removeQueueElementRef(entryId)
        },
        async autoPushHeartbeat() {
            if (!this.selectedEvent.feed.autoPush || this.selectedEvent.feed.pusherId != this.pusherId)
                return this.$cron.stop('autoPushHeartbeat')
            this.autoPushCounter += 1;
            if (this.autoPushCounter > this.autoPushGoal) {
                await this.autoPush();
            }
        },
        async autoPush() {
            if (this.filteredQueue && this.filteredQueue.length > 0) {
                var elementToPush = this.filteredQueue.sort((a,b) => a.approvedDate - b.approvedDate)[0];
                /* Calculate time to display the element */
                var textLength = (elementToPush.text && elementToPush.text.length) || 0;
                this.autoPushCounter = 0;
                this.autoPushGoal = Math.max((textLength / 1000) * 60, this.selectedEvent.feed.frequency)
                this.updateContribsCount(1);
                await this.sendContributionToFeed(elementToPush);
            }
        },
        async toggleAutoPush() {
            this.selectedEvent.feed.autoPush = !this.selectedEvent.feed.autoPush;
            this.selectedEvent.feed.pusherId = this.selectedEvent.feed.autoPush ? this.pusherId : null;
            await this.updateEvent(this.selectedEvent);
        }
    },
    watch: {
        'selectedEvent.feed.autoPush': {
            handler(val) {
                if (val)
                    this.$cron.start('autoPushHeartbeat')
                else
                    this.$cron.stop('autoPushHeartbeat')
            }
        }
    }
}
</script>
