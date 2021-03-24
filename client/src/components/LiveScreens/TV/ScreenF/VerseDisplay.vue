<template>
    <section class="flex h-full w-full text-left" v-if="loaded">
    <div>
    </div>
        <transition class="animate-height" mode="out-in" tag="div">
            <div v-if="verseToDisplay" class="verse font-bold text-white shadow-text text-4xl px-4"
                :key="verseToDisplay.id"
                >
                {{ verseToDisplay.content }}
            </div>
        </transition>
    </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import FeedEntry from '@/components/Feed/Base.vue'
import { ContributionTypes } from '@/models/contribution.js'

export default {
    components: {
        FeedEntry
    },
    props: ['displayPrevious', 'displayTime'],
    data: function() {
        return {
            loaded: false,
            verseToDisplay: null,
            initialLoad: true,
        }
    },
    computed: {
        ...mapGetters('events', ['event']),
        ...mapGetters('contributions', ['latestFeed']),
        LastVerse: function () {
        }
    },
    async mounted(){
        if (this.event != null) {
            await this.bindFeedRef(this.event.additionalFeed);
            this.loaded = true;
        }
    },
    methods: {
        ...mapActions('contributions', ['bindFeedRef']),
        loadLastVerse() {
            if (!this.loaded && !this.displayPrevious) {
                this.verseToDisplay = null;
                return
            }

            let verses = this.latestFeed.filter((el, i) => (el.type == ContributionTypes.BIBLEVERSE))
            if (verses.length > 0) {
                this.verseToDisplay = verses[0];
            } else {
                this.verseToDisplay = null;
            }
        }
    },
    watch: {
        async 'event.additionalFeed'(value) {
            this.loaded = false;
            await this.bindFeedRef(value);
            this.loaded = true;
            this.loadLastVerse();
        },
        latestFeed() {
            this.loadLastVerse()
        },
        verseToDisplay() {
            // Hide after x seconds
            if (this.verseToDisplay != null) {
                setTimeout(() => {this.verseToDisplay = null }, this.displayTime * 1000);
            }
        },
    }
}
</script>
<style scoped>
.list-enter-active {
    transition: all 1s;
    max-height: 100vh;
    opacity: 1;
}
.list-enter  {
  max-height: 0px;
  opacity: 0;
}
.verse {
    border: red 2px solid;
    background-color: rgba(51, 50, 200, 0.3);
    padding: 20px;
    border-radius: 20px;
    position: absolute;
    bottom: 150px;
    left: 150px;
}
</style>
