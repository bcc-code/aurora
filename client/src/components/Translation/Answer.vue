<template>
    <li class="mb-2 ml-10">
        <div class="bg-background-2 h-20 list-item">
            <div class="list-item-order">{{answer.order}}</div>
            <span v-if="source" class="font-medium" >{{answerText}}</span>
            <input v-else type="text" class="form-input" v-model="answerText" @keyup="updateTranslation"/>
        </div>
    </li>
</template>

<script>
import Translation from '@/mixins/translation'
import { mapActions } from 'vuex'
export default {
    props: ['source', 'answer', 'selectedLanguage', 'questionId'],
    data: function() {
        return {
            answerText: null,
            updateTimeout: null
        }
    },
    created: function(){
        this.updateText();
    },
    methods: {
        ...mapActions('translation', ['updateAnswer']),
        updateText(){
            this.answerText = this.inLanguage(this.answer, this.selectedLanguage);
        },
        async updateTranslation(){
            clearTimeout(this.updateTimeout)
            this.updateTimeout = setTimeout(async () => {
                this.translateTo(this.answer, this.selectedLanguage, this.answerText);
                this.answer.questionId = this.questionId;
                await this.updateAnswer(this.answer)
            }, 1000);

        }
    },
    watch: {
        selectedLanguage: {
            immediate: true,
            handler() {
                this.updateText()
            },
        },
    },
    mixins: [Translation]
}
</script>
