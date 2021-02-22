<template>
    <Form :entity="model" grid :columns="1" label-root="question">
        <Field name="question" label="question.text" type="select" allowEmpty :options="questions" :select-label="(q) => inLanguage(q, language)" />
        <template v-if="model.question != null">
            <Field name="view" type="select" allowEmpty :options="questionViews" />
            <section v-if="model.view === questionViews.WINNER">
                <div class="bg-background-2-plain p-2 rounded">
                    <p><b>{{correctAnswereesCount}}</b> people answered correctly</p>
                    <p v-if="model.question.winner != null">Winner: <b>{{displayName(model.question.winner)}} - {{churchAndCountry(model.question.winner)}}</b></p>
                    <p v-else>Winner: No winner has been picked</p>
                </div>
                <Field name="showCorrectAnswer" inline type="boolean" />
            </section>
            <Field v-else name="finished" inline type="boolean" />
        </template>
    </Form>
</template>
<script>
import { mapModels } from '@/mixins/mapModels';
import { mapState, mapGetters } from 'vuex';
import user from '@/mixins/user'
import Translation from '@/mixins/translation.js'
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    data: function () {
        return {
            correctAnswereesCount: 0
        }
    },
    mixins: [Translation, ScreenManagerComponent, user],
    computed: {
        ...mapState('questions', ['questions']),
        ...mapGetters('questions', ['answersByQuestionId', 'responsesByQuestionIdAndAnswerIds']),
        ...mapModels(['ScreenAQuestionViews', 'ScreenFQuestionViews']),
        questionViews() {
            return this.$parent.$parent.screen.id === 'A' ? this.ScreenAQuestionViews : this.ScreenFQuestionViews;
        },
    },
    watch: {
        'model.question': {
            immediate: true,
            async handler(question) {
                if(question == null) {
                    this.correctAnswereesCount = 0;
                    return;
                }
                let correctAnswers = [];
                switch (question.type) {
                    case 'multiple-choice':
                        correctAnswers = (await this.answersByQuestionId(question.id))?.filter(a => a.correct === true).map((doc) => doc.id);
                        break;
                    case 'slider': 
                        correctAnswers = [question.slider.correct];
                        break;
                }
                if(correctAnswers == null || correctAnswers.length <= 0) {
                    this.correctAnswereesCount = 0;
                    return;
                }
                var responses = await this.responsesByQuestionIdAndAnswerIds(question.id, correctAnswers);
                this.correctAnswereesCount = responses != null ? responses.length : 0;
            },
        },
    },
}
</script>