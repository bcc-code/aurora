<template>
	<div class="w-full mt-8">
        <Title class="mb-3">Liveboard</Title>
        <template v-if="!loaded" />
        <div class="w-full grid grid-cols-4 gap-4">
            <List class="col-span-full lg:col-span-3" :searchable="false" :elements="liveboard" @sorted="onSorted">
                <template v-slot:list="{ elements }">
                    <Liveboard v-for="element in elements" :key="element.id" :element="element" :editing="editingId == element.id" @edit="editingId = element.id" @close="editingId = 0" />
                </template>
                <template v-slot:newElement="{ nextOrder }">
                    <div v-if="$can('create', 'liveboard')" class="w-full max-w-lg mx-auto h-16 rounded-lg border-dashed border-2 border-gray-400 text-center pt-4"
                        @drop="onDrop($event, nextOrder)" @dragover.prevent @dragenter.prevent>
                        <span class="font-bold">+ Add</span>
                    </div>
                </template>
            </List>
            <div class="col-span-full lg:col-span-1">
                <h1 class="font-bold">Predefined components</h1>
                <ul class="flex flex-col w-full">
                    <li v-for="component in components" 
                        :key="component.id"
                        draggable @dragstart="startDrag($event, component)"
                        class="mb-2">
                        <div class="bg-background-2 list-item">
                            <div class="font-medium" >{{component.title[language]}}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Liveboard from '@/components/List/Elements/Liveboard.vue'
import NewElement from '@/components/List/NewElement.vue'
import List from '@/components/List/List.vue'
export default {
    components: {
        List,
        Liveboard,
        NewElement
    },
    data: function(){
        return {
            loaded: false,
            newElementType: 0,
            editingId: 0,
        }
    },
    computed: {
        ...mapState('liveboard', ['liveboard', 'components']),
    },
    async mounted(){
        await this.bindLiveboard();
        await this.bindComponents();
        this.loaded = true;
    },
    methods: {
        ...mapActions('liveboard', ['bindLiveboard', 'bindComponents', 'addLiveboardElement', 'reorderLiveboardElements']),
        async onAdd(newElement){
            var computedElement = { type: this.newElementType, order: newElement.order, texts: {} }
            computedElement['texts'][this.language] = newElement.text
            await this.addLiveboardElement(computedElement);
        },
        async onSorted(sortedElements){
            await this.reorderLiveboardElements(sortedElements);
        },
        startDrag(evt, item) {
			evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
			evt.dataTransfer.setData('itemID', item.id)
        },
        onDrop(evt, order) {
            const itemID = evt.dataTransfer.getData('itemID')
			if (itemID) {
                const component = { ...this.components.find(item => item.id == itemID) }
                component.order = order
				this.addLiveboardElement(component)
			}
		},
    }
}
</script>
