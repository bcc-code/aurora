<template>
	<div class="w-full mt-8">
        <Title>Program</Title>
        <template v-if="!loaded" />
        <List :elements="program" @sorted="onSorted">
            <template v-slot:list="{ elements, searchQuery }">
                <ProgramElement v-for="programElement in elements" :key="programElement.id" :programElement="programElement" :searchQuery="searchQuery" />
            </template>
            <template v-slot:newElement="{ nextId, nextOrder }">
                <NewElement v-if="$can('create', 'program')" :id="nextId" :order="nextOrder" @add="addProgramElement">
                    <template>
                        <div class="w-1/2">
                            <select v-model="newElementType" class="form-input" :value="ProgramElementType.SPEECH">
                                <option v-for="type in ProgramElementType" :key="type" :value="type">
                                    {{ProgramElementTypeLabel[type]}}
                                </option>
                            </select>
                        </div>
                    </template>
                </NewElement>
            </template>
        </List>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ProgramElementType,  ProgramElementTypeLabel } from '@/models/program.js'
import ProgramElement from '@/components/List/Elements/ProgramElement.vue'
import NewElement from '@/components/List/NewElement.vue'
import List from '@/components/List/List.vue'

export default {
    components: {
        List,
        ProgramElement,
        NewElement,
    },
    data: function(){
        return {
            loaded: false,
            newElementType: 0
        }
    },
    computed: {
        ...mapState('program', ['program']),
        ProgramElementType(){
            return ProgramElementType;
        },
        ProgramElementTypeLabel(){
            return ProgramElementTypeLabel;
        }
    },
    async mounted(){
        await this.bindProgramRef();
        this.loaded = true;
    },
    methods: {
        ...mapActions('program', ['bindProgramRef', 'addProgramElementRef', 'updateBatchProgramElementsRef']),
        async addProgramElement(newElement){
            var computedElement = { type: this.newElementType, order: newElement.order, texts: {} }
            computedElement['texts'][this.language] = newElement.text
            await this.addProgramElementRef(computedElement);
        },
        async onSorted(sortedElements){
            await this.updateBatchProgramElementsRef(sortedElements);
        }
    }
}
</script>
