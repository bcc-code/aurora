<template>
    <li class="mb-2 xl:w-1/4 lg:w-1/3 md:w-1/2 w-full px-4">
        <div class="transition duration-500 p-0 rounded relative" :class="[selected ? 'bg-yellow-500' : 'bg-blue-800']" @click="toggleSelect">
            <div class="px-4 py-3">
                <div class="font-semibold tracking-wide mb-2" v-html="highlight(displayName)"></div>
                <div v-if="churchAndCountry" class="text-label-2 text-sm mb-2" v-html="highlight(churchAndCountry)"></div>
                <div class="text-label-2 text-sm mb-2">{{date(entry.date)}}</div>
                <span class="text-white text-base" v-html="highlight(entry.text)"></span>
                <button v-if="entry.text && entry.text.length > 0" type="button" class=" ml-3 z-100 pointer-events-all transform transition-all duration-200 hover:scale-125" @click.stop="doCopy"><i class="far fa-clipboard"></i></button>
            </div>
            <img class="w-full rounded-b cursor-pointer" v-if="entry.imageUrl" :src="entry.imageUrl" @click="() => { if(enableLightbox) showLightbox = true }" />
            <Lightbox v-if="showLightbox" :src="entry.imageUrl" @close="showLightbox = false" />
            <slot></slot>
        </div>
    </li>
</template>
<script>
import { mapActions } from 'vuex'
import Lightbox from '@/components/Dialogs/Lightbox.vue'
import DateHelper from '@/mixins/date'
export default {
    components: {
        Lightbox
    },
    data: function() {
        return {
            showLightbox: false,
        }
    },
    props: ['entry', 'searchQuery', 'selected', 'enableLightbox'],
    methods: {
        ...mapActions('contributions', ['sendToFeedRef']),
        toggleSelect(){
            if (this.selected)
                this.$emit('deselect', this.entry)
            else
                this.$emit('select', this.entry)
        },
        highlight(text){
            return (this.searchQuery && this.searchQuery.trim()) 
                ? text.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-blue-500 rounded-sm'>\$1</span>") 
                : text;
        },
        doCopy: function () {
            this.$copyText(this.entry.text).then(
                (e) => { this.$toasted.success(this.$t('messages.text-copied')) },
                (e) => { console.error(e) }
            )
        }
    },
    mixins: [DateHelper],
    computed: {
        churchAndCountry() {
            return `${this.entry.churchName}${this.hasChurchAndCountry ? ', ' : ''}${this.entry.countryName}`
        },
        hasChurchAndCountry(){
            return this.entry.churchName && this.entry.countryName
        },
        displayName(){
            return this.entry.displayName == null 
                ? `${this.entry.firstName} ${this.entry.lastName}`
                : this.entry.displayName
        }
    },
}
</script>