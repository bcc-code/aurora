<template>
	<div v-if="loaded && options.view">
		<div class="relative w-full text-left rounded-xl overflow-hidden">
            <div class="w-full relative text-left bg-primary-dark p-5">
				<h3 class="text-2xl">{{ pre }}</h3>
				<h1 class="text-3xl font-bold">{{ title }}</h1>
			</div>
            		<div class="absolute w-full h-full opacity-75 bg-primary"></div>
			<div v-if="options.view == ScreenFQuestionViews.QUESTION" class="relative flex flex-wrap flex-1 w-full px-12 py-5">
				<div v-for="(answer, sI) in parsedAnswers" :key="answer.id" class="flex w-1/2 items-center p-4" 
					:class="hasLongAnswers ? 'w-1/2': `w-1/${parsedAnswers.length}`">
					<div class="border-2 rounded-md h-full w-full flex items-center transition-all duration-500" 
						:class="{'opacity-50': !answer.correct && options.finished}"
						:style="{
							backgroundColor: answer.correct && options.finished ? hexColors[answer.color] : '',
							borderColor: !options.finished || answer.correct ? hexColors[answer.color] : '#fff'
						}">
						<div class="pl-3 text-5xl font-bold transition-all duration-500" :class="hasLongAnswers ? 'w-1/12' : 'w-1/6'" 
							:style="{color: options.finished ? '#fff': hexColors[answer.color]}">
							{{ String.fromCharCode(sI + 65) }}
						</div>
						<div class="pl-3 text-4xl font-semibold">
							{{ inLanguage(answer, language) | limit }}
						</div>
					</div>
				</div>
			</div>
			<div v-else-if="options.view == ScreenFQuestionViews.RESPONSES" class="relative flex flex-wrap flex-1 w-full p-5" >
				<div v-for="(answer, sI) in parsedAnswers" :key="answer.id" class="flex items-center px-4 py-2 w-full" :class=" {'opacity-50': !answer.correct && options.finished}">
                    <div class="w-10 pr-3 text-3xl font-bold transition-all duration-500" :style="{color: hexColors[answer.color] }">
                        {{ String.fromCharCode(sI + 65) }}
                    </div>
                    <div key="wrapper" class="h-full flex items-center w-5/6 relative">
						<p class="text-2xl absolute px-4" :class="{'ml-6': answer.perc < 2}" :style="{left: `${answer.perc}%`}">
							<span class="font-semibold mr-5">{{ answer.perc }}%</span>
							<span v-if="!hasLongAnswers">{{ inLanguage(answer, language) | limit }}</span>
						</p>
						<div :key="`bar${sI}`" class="bar rounded-md h-12" :style="{backgroundColor: hexColors[answer.color], width: `${answer.perc}%`}">
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
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
    props: ['options'],
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
        ...mapGetters('events', ['currentEvent']),
        ...mapGetters('questions', ['answersByQuestionId']),
        ...mapModels(['ScreenFQuestionViews']),
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
        hasLongAnswers() {
			return this.parsedAnswers.some((answer) => this.inLanguage(answer, this.language).length > 30);
		},
        totalResponses() {
            var total = 0;
            for (var answer in this.stats.currentQuestion) {
                total += _.get(this.stats, `currentQuestion.${answer}.total`) || 0
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
            await Api.updateResponsesStats(this.currentEvent.id, this.options.question.id)
                .then((result) => {
                    this.stats = result.data;
                });
        },
        answerStats(answerId) {
            var answer = this.stats;
            var total = _.get(this.stats, `currentQuestion.${answerId}.total`) || 0;
            return {
                id: answerId,
                total: total,
                perc: this.totalResponses > 0 ? (total / this.totalResponses * 100).toFixed(1) : 0,
            }
        }
		
    },
    watch: {
        async options(){
            await this.loadQuestion();
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