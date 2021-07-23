<template>
    <SquareLayout id="grid" ref="grid" class="mx-10"
        :options="gridOptions"
        :layoutOptions="layoutOptions">
        <div class="item" v-for="picture in pictures" :id="`picture${picture.id}-${Math.random().toString(36).substring(7)}`" :key="picture.id + Math.random().toString(36).substring(7)">
            <img class="rounded-md" :src="picture.imageUrl" />
        </div>
    </SquareLayout>
</template>

<script>
import Vue from 'vue'
import { JustifiedLayout, SquareLayout } from "@egjs/vue-infinitegrid";
import { mapState, mapActions, mapGetters } from 'vuex'
import { crono } from 'vue-crono'
export default {
    components: {
       SquareLayout
    },
    props: ['options', 'event'],
    data: function(){
        return {
            pictures:[],
            index: 0,
            height: '',
            gridOptions: {
                isOverflowScroll: false,
                isConstantSize: false,
                useFit: true,
                useRecycle: true,
                horizontal: false,
                align: 'center',
            },
            feed: [],
            queue: [],
            additionalFeed: [],
        }
    },
    computed: {
        ...mapGetters('contributions', [ 'queueByEventIdRef', 'feedByEventIdRef']),
        numberOfColumns(){
            return parseInt(this.options.columns)
        },
        SIZE(){
            return this.numberOfColumns * this.numberOfColumns;
        },
        layoutOptions(){
            return {
                margin: 20,
                column: this.numberOfColumns,
            }
        }
    },
    methods: {
        filterPictures(list) {
            return list == null ? [] : list.filter(el => el.imageUrl != null && el.imageUrl.length > 0);
        },
        async loadPictures(){
            this.pictures= [];
            var allPictures = this.filterPictures(this.feed).
                concat(...this.filterPictures(this.queue)).
                concat(...this.filterPictures(this.additionalFeed));
            var first = allPictures.slice(0,this.SIZE);
            var next = [...first];
            var i = 1
            while (next.length > 0 && next.length % this.SIZE == 0 && i < 500) {
                this.pictures = this.pictures.concat(...next)
                next = allPictures.slice(this.SIZE*i,this.SIZE*(++i))
            }
            this.pictures = this.pictures.concat(...first)
        },
        checkLoaded(){
            const grid = this.$refs.grid.$el;
            const gridHeight = grid.style.height;
            if (gridHeight != null && gridHeight.length > 0 && gridHeight != '0px'){
                const firstElement = grid.children[0];
                if (grid.children.length > this.numberOfColumns){
                    const nextAppearance = grid.children[this.numberOfColumns];
                    const height = nextAppearance.offsetTop - firstElement.offsetTop;
                    grid.style.setProperty('--height', `-${height}px`);
                }
                grid.classList.add('grid-animate');

                const rowDuration = 30;
                const screenHeight = parseInt(grid.parentNode.style.height.substr(0, grid.parentNode.style.height.length-1));
                const d = Math.ceil(gridHeight.substr(0, gridHeight.length-2) / screenHeight) * rowDuration
                grid.style.animationDuration = `${Math.floor(d).toFixed()}s`;
                this.$cron.stop('checkLoaded');
            }
        }
    },
    async mounted(){
        if (this.event != null) {
            this.feed = (await this.feedByEventIdRef(this.event.id).get()).docs.map(x => x.data());
            this.queue = (await this.queueByEventIdRef(this.event.id).get()).docs.map(x => x.data());
            if (this.event.additionalFeed && this.event.additionalFeed.length > 0 && this.event.additionalFeed > 0 ) {
                this.additionalFeed = (await this.feedByEventIdRef(this.event.additionalFeed).get()).docs.map(x => x.data());
            }

            await this.loadPictures();
            this.$cron.start('checkLoaded');
        }
    },
    mixins: [crono],
    cron: {
        time: 1000,
        method: 'checkLoaded'
    },
    watch: {
        'options.columns'(value){
            window.location.reload();
        }
    }
}
</script>

<style scoped>
.grid-animate {
  animation: moveUp linear infinite;
  --height: -1080px;
}

#grid>div{
    overflow: hidden;
}

#grid>div>img {
    max-width: 300%;
    min-width: 100%;
    max-height: 100%;
    min-height: 100%;
}

@keyframes moveUp {
	0% {
        transform: translateY(0);
    }
	100% {
        transform: translateY(var(--height));
	}
}
</style>
