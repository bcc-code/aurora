<template>
    <li :id="`answer_${answer.id}`" class="mb-2">
        <div class="list-item flex-wrap bg-background-2">
            <div class="w-full flex">
                <div class="list-item-order self-center handle">{{answer.order}}</div>
                <Form :entity="answer" grid :columns="8" class="w-full">
                    <Field :name="`texts.${language}`" hideLabel type="text" class="md:col-span-4"/>
                    <Field name="color" hideLabel type="select" :options="AnswerColors" class="md:col-span-2" />
                    <Field name="correct" label="answers.correct" inline type="boolean"  class="md:col-span-2"/>
                </Form>
                <span class="btn btn-delete self-center" @click="deleteAnswer"><i class="fa fa-times"></i></span>
            </div>
        </div>
    </li>
</template>
<script>
import { mapActions } from 'vuex'
import { mapModels } from '@/mixins/mapModels'
export default {
    props: {
        answer: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapModels(['AnswerColors'])
    },
    methods: {
        ...mapActions('questions', ['removeAnswerRef']),
        async deleteAnswer(){
            await this.removeAnswerRef(this.answer.id);
        },
    }
}
</script>