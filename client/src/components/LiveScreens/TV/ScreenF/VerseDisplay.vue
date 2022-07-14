<template>
    <section class="
                absolute
                fpl-20
                px-4
                flex
                verse
    "v-if="loaded">
        <transition name="slide">
        <div>{{ event }}</div>
            <div v-if="verseToDisplay" class="
                bg-primary-dark
                font-bold
                rounded-xl
                justify-start
                hadow-text
                text-4xl
                verse-inner
                text-left
                text-white
                "
                :key="verseToDisplay.id"
                >
                {{ formattedVerse }}
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
    props: ['displayPrevious', 'displayTime', 'event'],
    data: function() {
        return {
            loaded: false,
            verseToDisplay: null,
        }
    },
    computed: {
        ...mapGetters('contributions', ['latestFeed']),
        formattedVerse: function () {
            let verseToDisplay = this.verseToDisplay;
            let out = `${verseToDisplay.verse.book } ${verseToDisplay.verse.chapter}:${verseToDisplay.verse.verse_from}`
            if (verseToDisplay.verse.verse_to) {
                out += `-${ verseToDisplay.verse.verse_to }`
            }
            return out;
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
            if ((!this.loaded && !this.displayPrevious) || this.latestFeed.length == 0) {
                this.verseToDisplay = null;
                return
            }

            if (this.displayPrevious) {
                let verses = this.latestFeed.filter((el, i) => (el.type == ContributionTypes.BIBLEVERSE))
                this.verseToDisplay = verses[0] || null;
                return
            }

            const lastElement = this.latestFeed[0]
            if (!lastElement || lastElement.type != ContributionTypes.BIBLEVERSE) {
                this.verseToDisplay = null;
                return
            }

            this.verseToDisplay = lastElement;
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
.verse {
    left: 124px;
    top: 866px;
}

.verse-inner {
    padding: 18px 38px;
}

.slide-enter-active,
.slide-leave-active {
    transition: opacity 1.3s, transform 1.3s;
}

.slide-enter, .slide-leave-to {
    opacity: 0;
    translateX: 10%;
}

</style>
