<template>
    <section class="flex items-center justify-between">
        <div class="flex flex-col leading-none">
            <span class="mb-2">Riktig svar:</span>
            <div v-if="question.type == 'multiple-choice' && correctAnswer && correctAnswer.texts">
                <span class="w-6 h-6 rounded-full inline-block"
                :style="{background: colors[correctAnswer.color]}"></span>
                <span class="ml-2">{{correctAnswer.texts.no}}</span>
            </div>
            <span v-else-if="question.type == 'slider'">
                {{question.slider.correct}}
            </span>
        </div>
    </section>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    props: ['question'],
    data: function() {
        return {
            answers: [],
            colors: {
                pink: "#EB3B67",
                green: "#5FE76C",
                yellow: "#FDCF48",
                blue: "#6EB0E6"
            }
        }
    },
    async mounted(){
		if (this.question != null){
            this.answers = await this.answersByQuestionId(this.question.id);
        }
	},
    computed: {
        ...mapGetters('questions', ['answersByQuestionId']),
        correctAnswer() {
            const correctAnswers = this.answers.filter(a => a.correct === true)
            return correctAnswers && correctAnswers[0];
        },
    }
}
</script>