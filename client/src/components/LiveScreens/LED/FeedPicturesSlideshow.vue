<template>
    <transition-group name="fade" tag="section">
        <img :src="imageUrl" :key="`image-${imageUrl}`" class="absolute top-0 object-contain w-full h-full z-10">
    </transition-group>
</template>

<script>
import Vue from 'vue'
import { mapState, mapActions, mapGetters } from 'vuex'
import { crono } from 'vue-crono'
export default {
    data: function(){
        return {
            index: 0
        }
    },
    computed: {
        ...mapState('contributions', ['queue']),
        ...mapGetters('contributions', ['feed']),
        ...mapGetters('events', ['currentEvent']),
        allPictures() {
            return this.filterPictures(this.feed).concat(...this.filterPictures(this.queue));
        },
        imageUrl() {
            const currentEntry = this.allPictures[this.index];
            return currentEntry ? currentEntry.imageUrl : null;
        }
    },
    methods: {
        ...mapActions('contributions', ['bindFeedRef', 'bindQueueRef']),
        filterPictures(list) {
            return list == null ? [] : list.filter(el => el.imageUrl != null && el.imageUrl.length > 0);
        },
        switchPicture(){
            this.index = (this.index + 1) % (this.allPictures.length);
        },
    },
    async mounted(){
        if (this.currentEvent != null) {
            await this.bindFeedRef(this.currentEvent.additionalFeed);
            await this.bindQueueRef();
        }
    },
    mixins: [crono],
    cron: {
        time: 10000,
        method: 'switchPicture'
    },
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
