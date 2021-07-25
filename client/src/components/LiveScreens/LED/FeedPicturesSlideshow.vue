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
            index: 0,
            feed: [],
            queue: [],
            additionalFeed: [],
        }
    },
    props: ['event'],
    computed: {
        ...mapGetters('contributions', ['feedByEventIdRef', 'queueByEventIdRef']),
        allPictures() {
            return this.filterPictures(this.feed).concat(...this.filterPictures(this.queue));
        },
        imageUrl() {
            const currentEntry = this.allPictures[this.index];
            return currentEntry ? currentEntry.imageUrl : null;
        }
    },
    methods: {
        filterPictures(list) {
            return list == null ? [] : list.filter(el => el.imageUrl != null && el.imageUrl.length > 0);
        },
        switchPicture(){
            this.index = (this.index + 1) % (this.allPictures.length);
        },
    },
    async mounted(){
        if (this.event != null) {
            this.feed = (await this.feedByEventIdRef(this.event.id).get()).docs.map(x => x.data());
            this.queue = (await this.queueByEventIdRef(this.event.id).get()).docs.map(x => x.data());

            if (this.event.additionalFeed && this.event.additionalFeed.length > 0 && this.event.additionalFeed > 0 ) {
                this.additionalFeed = (await this.feedByEventIdRef(this.event.additionalFeed).get()).docs.map(x => x.data());
            }
        }
    },
    mixins: [crono],
    cron: {
        time: 10*1000,
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
