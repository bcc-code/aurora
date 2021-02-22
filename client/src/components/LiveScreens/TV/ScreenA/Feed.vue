<template>
    <section class="flex h-full w-full text-left" v-if="loaded">
        <div class="h-full overflow-y-auto py-12 px-2"
        :class="columns == 2 ? 'w-1/2' : 'w-full'"
        v-for="columnIndex in Array.from(Array(columns).keys())"
        :key="columnIndex">
            <transition-group name="list" class="animate-height" tag="div">
                <FeedEntry v-for="(element) in latestFeed.filter((el, i) => i%columns == (columnIndex + columnOffset)%columns)" 
                    :key="element.id"
                    :entry="element"
                    size="big" 
                    theme="tv"/>
            </transition-group>
        </div>
    </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import FeedEntry from '@/components/Feed/Base.vue'

export default {
    components: {
        FeedEntry
    },
    data: function() {
        return {
            columnOffset: 0,
            loaded: false,
        }
    },
    props: {
        columns: {
            type: Number,
            default: 1
        }
    },
    computed: {
        ...mapGetters('events', ['currentEvent']),
        ...mapGetters('contributions', ['latestFeed']),
    },
    async mounted(){
        if (this.currentEvent != null) {
            await this.bindFeedRef(this.currentEvent.components.additionalFeed);
            this.loaded = true;
        }
    },
    methods: {
        ...mapActions('contributions', ['bindFeedRef']),
    },
    watch: {
        async 'currentEvent.components.additionalFeed'(value) {
            this.loaded = false;
            await this.bindFeedRef(value);
            this.loaded = true;
        },
        latestFeed() {
            if (this.columns == 2)
                this.columnOffset = (this.columnOffset + 1)%2
        }
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
</style>