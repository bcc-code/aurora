<template>
    <transition name="zoom">
        <div class="w" v-if="loaded">
            <div class="QuizResults relative p-12 text-white leading-tight flex flex-col justify-center items-center w-full h-full overflow-hidden" title="QuizResults">
                <div class="relative text-center flex flex-col items-center justify-center px-24 h-48">
                    <h1 class="text-6xl font-bold">Duel<br/>U18 vs O18</h1>
                </div>
                <div class="relative flex flex-1 w-full p-32" :class="isHorizontal ? 'flex-col justify-between' : 'items-center'">
                    <div class="flex items-center px-4" :class="[isHorizontal ? 'w-full' : `flex-col h-full justify-center w-1/2`]">
                        <p class="font-medium p-4" :class="isHorizontal ? 'text-3xl w-1/6' : `text-4xl w-full text-center order-2 h-40`">O18</p>

                        <div v-if="isHorizontal" key="wrapper" class="h-full flex items-center w-5/6 relative">
                            <p class="text-2xl absolute px-4" :style="{left: `${ageStats.over*100}%`}">{{ (ageStats.over*100).toFixed(2) }}%</p>
                            <div :key="`barOver`" class="bar h-12" :style="{backgroundColor: '#08234B', width: `${ageStats.over*100}%`}"></div>
                        </div>
                        <template v-else>
                            <div key="wrapper" class="wrapper flex flex-col items-center justify-end flex-1 h-full order-1 relative">
                                <p class="text-2xl absolute w-full text-center py-2" :style="{bottom: `${ageStats.over*100}%`}">{{ ageStats.over*100 }}%</p>
                                <div :key="`barOver`" class="bar rounded-full w-12" :style="{backgroundColor: '#08234B', height: `${ageStats.over*100}%`}"></div>
                            </div>
                        </template>
                    </div>

                    <div class="flex items-center px-4" :class="[isHorizontal ? 'w-full' : `flex-col h-full justify-center w-1/2`]">
                        <p class="font-medium p-4" :class="isHorizontal ? 'text-3xl w-1/6' : `text-4xl w-full text-center order-2 h-40`">U18</p>
                        <div v-if="isHorizontal" key="wrapper" class="h-full flex items-center w-5/6 relative">
                            <p class="text-2xl absolute px-4" :style="{left: `${ageStats.under*100}%`}">{{ ageStats.under*100 }}%</p>
                            <div :key="`barUnder`" class="bar rounded-full h-12" :style="{backgroundColor: '#08234B', width: `${ageStats.under*100}%`}"></div>
                        </div>
                        <template v-else>
                            <div key="wrapper" class="wrapper flex flex-col items-center justify-end flex-1 h-full order-1 relative">
                                <p class="text-2xl absolute w-full text-center py-2" :style="{bottom: `${ageStats.under*100}%`}">{{ (ageStats.under*100).toFixed(2) }}%</p>
                                <div :key="`barUnder`" class="bar rounded-full w-12" :style="{backgroundColor: '#08234B', height: `${ageStats.under*100}%`}"></div>
                            </div>
                        </template>
                    </div>

                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import Api from '@/utils/api.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import { mapModels } from '@/mixins/mapModels'
import Translation from '@/mixins/translation.js'
import { crono } from 'vue-crono'
import EventBus from '@/utils/eventBus.js'
import _ from 'lodash'
export default {
    props: ['options', 'event'],
    data: function(){
        return {
            loaded: false,
        }
    },
    mixins: [Translation, crono],
    computed: {
        ...mapGetters('questions', ['answersByQuestionId', 'ageStats']),
        ...mapModels(['LEDQuestionViews']),
        isHorizontal() {
            return this.options.viewType == 'bars-h'
        },
    },
    async mounted(){
        await this.bindAgeStatsRef(this.event.id);
        console.log(this.ageStats);
        this.loaded = true
    },
    methods: {
        ...mapActions('questions', ['bindStatsRef', 'bindAgeStatsRef']),
        async updateStats() {
            await Api.updateAgeBasedPollResults(this.event.id);
        },
    },
    watch: {
        options: {
            deep: true,
            async handler() {
                await this.loadQuestion();
            }
        }
    },
    cron: {
        time: 5000,
        method: 'updateStats'
    },
    filters: {
      limit(v) {
        if (v == null)
          return v
        let w = v.split(' ')
        let n = '';
        while (n.length < 300 && w.length > 0) {
          n += w.splice(0, 1)[0] + ' '
        }
        n = n.trim()
        if (n != v) n += '…'
        return n
      }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo:wght@700&display=swap');
.zoom-leave-active {
  transition: opacity 1s, transform 1s;
  position: absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
}
.zoom-enter {
  opacity: 0;
  transform: scale(1.2);
}
.zoom-leave-to {
  opacity: 0;
  transform: scale(.8);
}

.QuizResults * {
  text-shadow: 0 1px 2px rgba(0,0,0,.4);
}
.bar {
  transition: 1s all ease;
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.wrapper {
  transition: 1s all ease;
}
.w {
    font-family: 'Exo', sans-serif;
}
</style>
