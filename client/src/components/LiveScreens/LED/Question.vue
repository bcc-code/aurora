<template>
    <transition name="zoom">
        <div v-if="loaded">
            <div class="QuizResults relative p-12 text-white leading-tight flex flex-col justify-center items-center w-full h-full overflow-hidden" title="QuizResults">
                <div class="relative text-center flex flex-col items-center justify-center px-24 h-48">
                    <h3 class="text-4xl">{{ pre }}</h3>
                    <h1 class="text-6xl font-bold">{{ title }}</h1>
                </div>
                <div class="relative flex flex-wrap flex-1 w-full px-24 py-8" v-if="options.viewType == 'tiles'">
                    <template v-if="options.view == LEDQuestionViews.WINNER">
                        <div class="flex-1 flex items-center h-full w-full absolute inset-0">
                            <div class="w-full flex items-center justify-start h-full">
                                <div class="absolute inset-y-0 left-0 flex items-center">
                                    <p class="text-5xl p-8">Winner: {{options.question.winner.displayName}}</p>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="(answer, sI) in parsedAnswers" :key="answer.id" class="flex w-1/2 items-center p-4 transition-all" style="height: 50%" :class="{'opacity-50': !answer.correct && options.questionFinished}">
                            <div class="border-4 bg-blue-slate rounded-xl relative h-full w-full pb-4" :style="{borderColor: hexColors[answer.color]}">
                                <template v-if="options.view == LEDQuestionViews.RESPONSES">
                                    <div v-if="answer.total" key="wrapper" class="absolute inset-x-0 bottom-0 rounded-b-lg overflow-hidden">
                                        <div :key="`bar${sI}`" class="bar h-10 rounded-tr-full text-right pr-5 pt-2" :style="{background: hexColors[answer.color], width: `${answer.perc}%`}">
                                            {{answer.perc}}%
                                        </div>
                                    </div>

                                </template>

                                <div class="absolute top-0 inset-x-0 -mt-5 flex justify-center">
                                    <p class="text-2xl leading-none py-2 text-center font-semibold rounded-full w-10 h-10" :style="{background: hexColors[answer.color]}">{{ String.fromCharCode(sI + 65) }}</p>
                                </div>

                                <div class="w-full h-full flex items-center justify-center p-4">
                                    <p class="relative p-4 text-center text-5xl">{{ inLanguage(answer, language) | limit }}</p>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-else class="relative flex flex-1 w-full p-32" :class="isHorizontal ? 'flex-col justify-between' : 'items-center'">
                    <div v-for="(answer, sI) in parsedAnswers" :key="answer.id" class="flex items-center px-4" :class="[isHorizontal ? 'w-full' : `flex-col h-full justify-center w-1/${parsedAnswers.length}`, {'opacity-50': !answer.correct && options.questionFinished}]">
                        <p class="font-medium p-4" :class="isHorizontal ? 'text-3xl w-1/6' : `text-4xl w-full text-center order-2 h-40`">{{ inLanguage(answer, language) | limit }}</p>
                        <div v-if="options.view == LEDQuestionViews.QUESTION" key="wrapper" class="wrapper flex flex-col items-center justify-end w-full h-auto text-center p-4 order-1">
                            <div :key="`bar${sI}`" class="bar w-32 rounded-full" :style="{backgroundColor: hexColors[answer.color], height: '0%', minHeight: '8rem'}"></div>
                        </div>
                        <div v-else-if="options.view == LEDQuestionViews.RESPONSES && isHorizontal" key="wrapper" class="h-full flex items-center w-5/6 relative">
                            <p class="text-2xl absolute px-4" :style="{left: `${answer.perc}%`}">{{ answer.perc }}%</p>
                            <div :key="`bar${sI}`" class="bar rounded-full h-12" :style="{backgroundColor: hexColors[answer.color], width: `${answer.perc}%`}"></div>
                        </div>
                        <template v-else>
                            <div v-if="options.view == LEDQuestionViews.RESPONSES" key="wrapper" class="wrapper flex flex-col items-center justify-end flex-1 h-full order-1 relative">
                                <p class="text-2xl absolute w-full text-center py-2" :style="{bottom: `${answer.perc}%`}">{{ answer.perc }}%</p>
                                <div :key="`bar${sI}`" class="bar rounded-full w-12" :style="{backgroundColor: hexColors[answer.color], height: `${answer.perc}%`}"></div>
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
            responses: {},
            answers: {},
            stats: {},
            hexColors: {
                pink: "#EB3B67",
                green: "#5FE76C",
                yellow: "#FDCF48",
                blue: "#6EB0E6"
            },
        }
    },
    mixins: [Translation, crono],
    computed: {
        ...mapGetters('questions', ['answersByQuestionId']),
        ...mapModels(['LEDQuestionViews']),
        pre() {
            if (this.options.question == null )
              return '';
            var split = this.inLanguage(this.options.question, this.language).split('.')
            return split.length > 1 ? split.slice(0, split.length - 1).join('.') + '.' : ''
        },
        title() {
            if (this.options.question == null )
                return '';
            var split = this.inLanguage(this.options.question, this.language).split('.')
            return split.length > 1 ? split[split.length - 1] : split[0]
        },
        isHorizontal() {
            return this.options.viewType == 'bars-h'
        },
        totalResponses() {
            var total = 0;
            for (var answer in this.stats.currentQuestion) {
                total += this.stats.currentQuestion[answer] || 0;
            }
            return total;
        },
        parsedAnswers() {
            return this.answers.slice().map((answer) => Object.assign({...answer}, this.answerStats(answer.id)))
        }
    },
    async mounted(){
        if (this.options.question != null) {
            await this.loadQuestion();
            await this.bindStatsRef();
            await this.updateStats();
        }
        this.loaded = true
    },
    methods: {
        ...mapActions('questions', ['bindStatsRef']),
        async loadQuestion(){
            this.answers = await this.answersByQuestionId(this.options.question.id);
        },
        async updateStats() {
            await Api.updateResponsesStats(this.event.id, this.options.question.id)
                .then((result) => {
                    this.stats = result.data;
                });
        },
        answerStats(answerId) {
            var answer = this.stats;
            let aStats = this.stats.currentQuestion[answerId] || 0;
            var total = aStats
            return {
                id: answerId,
                total: total,
                perc: this.totalResponses ? (total / this.totalResponses * 100).toFixed(1) : 0,
            }
        }
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
.zoom-enter-active,
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
</style>
