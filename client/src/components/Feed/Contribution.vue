<template>
    <div class="rounded-xl m-2 mb-8" v-if="loaded">
        <div class="text-white leading-tight py-6 px-8 text-left rounded-t-2xl" :class="theme == 'tv' ? 'bg-primary': 'bg-slate'">
            <p class="font-semibold" :class="isBig ? 'text-4xl' : 'text-xl'">{{ displayName }}</p>
            <p class="opacity-50" :class="isBig ? 'text-3xl' : 'text-lg'">{{ churchAndCountry }}</p>
        </div>
        <p v-if="contribution.text" class="py-6 px-8 shadow-top" :class="[isBig ? 'text-3xl' : 'text-xl', {'rounded-b-xl': !hasPicture }, theme == 'tv' ? 'bg-primary-dark': 'bg-slate-dark']">{{contribution.text}}</p>
        <div v-if="hasPicture" :class="{'shadow-over': !contribution.text}">
            <img :src="contribution.imageUrl" class="w-full rounded-b-xl" />
        </div>
    </div>
    <div v-else></div>
</template>
<script>
import DateHelper from '@/mixins/date.js'
import FeedPicture from '@/components/Pictures/FeedPicture.vue'
export default {
    components: {
        FeedPicture
    },
    props: {
        theme: {
            type: String,
            default: 'default'
        },
        contribution: {
            type: Object,
            required: true
        },
        size: {
            type: String,
            default: 'normal'
        }
    },
    data: () => ({
        loaded: false,
    }),
    created: function() {
        if (!this.hasPicture) {
            this.loaded = true;
            return;
        }

        // Preload image into browser cache so it will be animated in properly
        let img = new Image();
        img.onload = () => { this.loaded = true; }
        img.src = this.contribution.imageUrl
    },
    mixins: [DateHelper],
    computed: {
        churchAndCountry() {
            return `${this.contribution.churchName}${this.hasChurchAndCountry ? ', ' : ''}${this.contribution.countryName}`
        },
        hasChurchAndCountry(){
            return this.contribution.churchName != null && this.contribution.countryName != null && this.contribution.countryName.length > 0
        },
        displayName(){
            return this.contribution.displayName == null
                ? `${this.contribution.firstName} ${this.contribution.lastName}`
                : this.contribution.displayName
        },
        hasPicture() {
            return this.contribution.imageUrl != null && this.contribution.imageUrl.length > 0
        },
        isBig() {
            return this.size == 'big'
        }
    },
}
</script>
