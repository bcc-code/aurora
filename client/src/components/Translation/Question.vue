<template>
    <section>
        <li class="mb-2">
            <div class="bg-background-2 h-20 list-item">
                <div class="list-item-order">{{question.order}}</div>
                <div v-if="source" class="font-medium" >{{questionText}}</div>
                <input v-else type="text" class="form-input" v-model="questionText" @keyup="updateTranslation"/>
            </div>
        </li>
        <ul class="flex flex-col p-4 w-full">
            <Answer v-for="answer in questionAnswers" :key="selectedLanguage + answer.id" :answer="answer" :questionId="question.id" :source="source" :selectedLanguage="selectedLanguage"/>
        </ul>
    </section>
</template>

<script>
import Translation from '@/mixins/translation'
import Answer from './Answer'
import { mapState, mapActions, mapGetters } from 'vuex'
export default {
    props: ['source', 'question', 'selectedLanguage'],
    components: {
        Answer
    },
    mixins: [Translation],
    data: function() {
        return {
            questionText: null,
            updateTimeout: null,
        }
    },
    mounted: async function(){
        this.updateText();
    },
    computed: {
        ...mapState('translation', ['answers']),
        questionAnswers() {
            return this.answers[this.question.id]
        }
    },
    methods: {
        ...mapActions('translation', ['updateQuestionRef']),
        updateText(){
            this.questionText = this.inLanguage(this.question, this.selectedLanguage);
        },
        async updateTranslation(){
            clearTimeout(this.updateTimeout)
            this.updateTimeout = setTimeout(async () => {
                this.translateTo(this.question, this.selectedLanguage, this.questionText);
                await this.updateQuestionRef(this.question)
            }, 1000);
        }
    },
    watch: {
        selectedLanguage: {
            // call it upon creation too
            immediate: true,
            handler() {
                this.updateText()
            },
        },
    }
}
</script>