<template>
    <section v-if="loaded">
        <Form :entity="selectedQuestion" v-if="selectedQuestion.canChangeAnswer" class="py-2">
            <Field name="defaultAnswerId" label="question.defaultAnswer" type="select" :options="answers" select-key="id" :select-label="`texts.${language}`" />
        </Form>
        <span class="uppercase tracking-wide text-xs font-bold px-4">{{$t('answers.text')}}</span>
        <List :elements="answers" :searchable="false" @sorted="onSorted">
            <template v-slot:list="{ elements }">
                <Answer v-for="answer in elements" :key="answer.id" :answer="answer" />
            </template>
            <template v-slot:newElement="{ nextOrder }">
                <NewElement v-if="$can('create', 'answer')" :key="nextOrder" :order="nextOrder" @add="addAnswer">
                    <Form :entity="newAnswer" grid :columns="2" class="w-1/2 pl-5">
                        <Field name="color" hideLabel type="select" :options="AnswerColors" />
                        <Field name="correct" label="answers.correct" inline type="boolean" />
                    </Form>
                </NewElement>
            </template>
        </List>
	</section>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { mapModels } from '@/mixins/mapModels'
import List from '@/components/List/List'
import NewElement from '@/components/List/NewElement'
import Answer from '@/components/List/Elements/Answer'
export default {
    components: {
        List,
        Answer,
        NewElement
    },
    data: function(){
        return {
            newAnswer: {
                color: 'pink',
                correct: false
            },
            loaded: false
        }
    },
    async mounted() {
        await this.bindAnswersRef();
        this.loaded = true;
    },
    computed: {
        ...mapGetters('questions', ['selectedQuestion']),
        ...mapState('questions', ['answers']),
        ...mapModels(['AnswerColors'])
    },
    methods: {
        ...mapActions('questions', ['bindAnswersRef', 'addAnswerRef', 'updateAnswerRef', 'updateBatchAnswersRef']),
        async addAnswer(newAnswer){
            var computedNewAnswer = { order: newAnswer.order, color: this.newAnswer.color, correct: this.newAnswer.correct, texts: {}, id: Math.floor(Math.random() * 10000).toString()}
            computedNewAnswer.texts[this.language] = newAnswer.text
            await this.addAnswerRef(computedNewAnswer).then(() => {
                this.newAnswer = { color: 'pink', correct: false }
            });
        },
        async onSorted(sortedAnswers){
            await this.updateBatchAnswersRef(sortedAnswers);
        },
        async save() {
            await Promise.all(this.answers.map((answer) =>  { this.updateAnswerRef(answer) }))
        }
    }
}
</script>