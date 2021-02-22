<template>
    <section class="w-full">
        <div class="relative text-label-3 py-4" v-if="searchable">
            <input type="search" name="serch" :placeholder="searchPlaceholder" v-model="searchQuery" class="bg-background-2 h-10 px-5 pr-10 rounded-md w-full focus:outline-none">
        </div>
        <ul class="flex flex-col w-full">
            <template>
                <slot name="header"></slot>
                <draggable v-model="sortedElements" tag="ul" ghost-class="ghost" @change="sort" handle=".handle" 
                    :class="{'flex flex-wrap -mx-4 items-top' : revert}" :animation="200" :disabled="!$can('update', sortedElements)">
                    <slot name="list" v-bind:searchQuery="searchQuery" v-bind:elements="filteredElements"></slot>
                </draggable>
                <slot name="newElement" v-bind:nextOrder="newElementOrder"></slot>
            </template>
        </ul>
    </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Translation from '@/mixins/translation'
import draggable from 'vuedraggable'

export default {
    components: {
        draggable
    },
    data() {
        return {
            searchQuery: "",
            sortedElements: [],
        }
    },
    props: {
        elements: {
            type: Array,
            default: () => [],
        },
        multiLang: {
            type: Boolean,
            default: true
        },
        searchable: {
            type: Boolean,
            default: true
        },
        revert: {
            type: Boolean,
            default: false
        }
    },
    mixins: [Translation],
    computed: {
        searchPlaceholder(){
            return this.$t("search");
        },
        filteredElements(){
            return this.elements.filter((el) => {
                if (this.searchQuery.trim() == "")
                    return true;
                if (this.multiLang)
                    return this.search(this.inLanguage(el, this.language), this.searchQuery)
                else 
                    return Object.keys(el).some(key => this.search(el[key], this.searchQuery))
            });
        },
        newElementOrder(){
            if (this.elements == null)
                return 0;
            return Math.max(0, Math.max(...this.elements.map((el) => el.order)) + 1);
        },
    },
    created(){
        this.sortElements();
    },
    methods: {
        search(text, query){
            return typeof text == "string" && text.toLowerCase().indexOf(query.toLowerCase()) > -1;
        },
        sortElements(){
            this.sortedElements = this.filteredElements;
            if (this.sortable)
                this.sortedElements.sort((a,b) => a.order - b.order)
        },
        sort(e){            
            this.sortedElements.map((element, index) => element.order = index + 1);
            this.sortedElements.sort((a,b) => a.order - b.order);
            this.$emit('sorted', this.sortedElements);
        }
    },
    watch: {
        filteredElements: {
            immediate: true,
            handler(value) {
                this.sortElements();
            }
        }
    }
}
</script>
<style scoped>
.ghost {
    box-shadow: 10px 10px 5px -1px rgba(0,0,0,0.14);
    opacity: .7;
}
</style>