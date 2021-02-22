<template>
    <li class="mb-2" @click.stop="$emit('select', question)">
        <div class="cursor-pointer list-item" :class="[ inQuizz ? 'bg-yellow-500' : pollQuestions.includes(question.id) ? 'bg-green-500' : 'bg-background-2']">
            <div class="list-item-order handle">{{question.order}}</div>
            <div class="font-medium" v-html="text"></div>
            <div v-if="$can('update', question)" class="overlay">
                <button v-if="inQuizz" class="btn btn-red" @click.stop="$emit('remove', question)">{{$t('question.remove-from-quizz')}}</button>
                <button v-else class="btn btn-green" @click.stop="$emit('add', question)">{{$t('question.add-to-quizz')}}</button>
                <span v-if="$can('delete', question)" class="btn btn-delete" @click.stop="removeQuestion"><i class="fa fa-times"></i></span>
            </div>
        </div>
    </li>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import Translations from '@/mixins/translation.js'
import Api from '@/utils/api'
export default {
    props: {
        question: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        },
        inQuizz: {
            type: Boolean,
            default: false
        }
    },
    mixins: [Translations],
    computed: {
        ...mapState('gameboard', ['gameboard']),
        ...mapGetters('events', ['selectedEvent']),
        ...mapGetters('gameboard', ['pollQuestions']),
        text() {
            var text = this.inLanguage(this.question, this.language);
            return (this.searchQuery && this.searchQuery.trim()) 
                ? text.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-blue-500 rounded-sm'>\$1</span>") 
                : text;
        }
    },
    methods: {
        async removeQuestion(){
            await Api.deleteQuestion(this.selectedEvent.id, this.question.id)
                .then(this.showSuccess('messages.question-deleted'))
                .catch(this.showError)
        },
    }
}
</script>