<template>
	<OneColumn>
        <Title class="mb-5" >Desk</Title>
        <div class="lg:w-1/2 w-full mt-8 mx-auto">
            <div class="flex flex-wrap -mx-3 mb-6">
                <div class="flex justify-between w-full">
                    <div class="w-2/3 mb-3">
                        <select v-model="newDeskEntry.type" required class="form-input">
                            <option v-for="type in AllowedTypes" :key="type" :value="type">
                                {{ContributionTypesLabels[type]}}
                            </option>
                        </select>
                    </div>
                    <button class="btn btn-green mb-3" :class="{'disabled': !isCompleted}" @click="addElement">{{$t('element.add')}}</button>
                </div>
                <template v-if="newDeskEntry.type == ContributionTypes.QUOTE">
                    <textarea rows="3" class="mb-3 form-input" v-model="newDeskEntry.content" placeholder="Quote" />
                    <input type="text" class="mb-3 form-input" v-model="newDeskEntry.author" placeholder="Author" />
                    <input type="text" class="mb-3 form-input" v-model="newDeskEntry.source" placeholder="Source" />
                </template>
                <template v-else-if="newDeskEntry.type == ContributionTypes.BIBLEVERSE">
                    <BibleVerse v-model="newDeskEntry" />
                </template>
                <template v-else-if="newDeskEntry.type == ContributionTypes.INFORMATION">
                    <textarea rows="3" class="mb-3 form-input" v-model="newDeskEntry.content" placeholder="Information" />
                </template>
                <template v-else>
                    <input type="text" class="mb-3 form-input" v-model="newDeskEntry.title" placeholder="Title" />
                    <textarea rows="3" class="mb-3 form-input" v-model="newDeskEntry.content" placeholder="Content" />
                </template>
                <List :elements="desk" :searchable="false">
                    <template v-slot:list="{ elements }">
                        <DeskEntry v-for="element in elements" :key="element.id" :element="element"/>
                    </template>
                    <template v-slot:newElement></template>
                </List>
                <List :elements="liveDesk" :searchable="false">
                    <template v-slot:list="{ elements }">
                        <LiveDeskEntry v-for="element in elements" :key="element.id" :element="element"/>
                    </template>
                    <template v-slot:newElement></template>
                </List>
            </div>
        </div>
	</OneColumn>
</template>

<script>
import { ContributionTypes, ContributionTypesLabels } from '@/models/contribution.js'
import { mapState, mapActions } from 'vuex';
import List from '@/components/List/List.vue'
import DeskEntry from '@/components/List/Elements/Contribution/Desk.vue'
import LiveDeskEntry from '@/components/List/Elements/Contribution/LiveDesk.vue'
import BibleVerse from '@/components/Forms/BibleVerse.vue';
export default {
    components: {
        List,
        DeskEntry,
        LiveDeskEntry,
        BibleVerse,
    },
    data: function() {
        return {
            newDeskEntry: { type: 4 }
        }
    },
    computed: {
        ...mapState('contributions', ['desk', 'liveDesk']),
        AllowedTypes(){
            return [ContributionTypes.DEFAULT, ContributionTypes.INFORMATION, ContributionTypes.QUOTE, ContributionTypes.BIBLEVERSE];
        },
        ContributionTypes(){
            return ContributionTypes
        },
        ContributionTypesLabels(){
            return ContributionTypesLabels;
        },
        isCompleted(){
            if (this.newDeskEntry.type == ContributionTypes.BIBLEVERSE && !this.newDeskEntry.author) {
                return false;
            }
            return this.newDeskEntry.content && this.newDeskEntry.content.length > 0;
        },
    },
    async mounted(){
        await this.bindDeskRef()
        await this.bindLiveDeskRef();
    },
    methods: {
        ...mapActions('contributions', ['addToDeskRef']),
        ...mapActions('contributions', ['bindDeskRef']),
        ...mapActions('contributions', ['bindLiveDeskRef']),
        async addElement(){
            if (this.isCompleted) {
                this.newDeskEntry.date = Date.now();
                // if(this.newDeskEntry.verse.verse_to == undefined) {
                //     this.newDeskEntry.verse.verse_to = this.newDeskEntry.verse.verse_from
                // }
                await this.addToDeskRef(this.newDeskEntry).then((result) => {
                    this.$toasted.success(this.$t('queue.element-added'));
                    const newDeskEntry = { type: 1 };
                    for (const p in this.newDeskEntry) {
                        newDeskEntry[p] = this.newDeskEntry[p]
                    }
                    this.newDeskEntry = newDeskEntry
                });
            }
        }
    }
}
</script>
