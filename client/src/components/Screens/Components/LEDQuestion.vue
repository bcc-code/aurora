<template>
    <Form :entity="model" grid :columns="1" label-root="question">
        <Field name="question" label="question.text" type="select" :options="questions" :select-label="(q) => inLanguage(q, language)" />
        <Field name="view" type="select" :options="LEDQuestionViews" />
        <Field name="viewType" type="select" :options="viewTypes" select-key="id" select-label="label" />
        <Field name="finished" inline type="boolean" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
import { mapModels } from '@/mixins/mapModels'
import { mapState } from 'vuex'
import Translation from '@/mixins/translation.js'
export default {
    mixins: [Translation, ScreenManagerComponent],
    data: function() {
        return {
            viewTypes: [
                { id: 'tiles', label: 'Tiles' },
                { id: 'bars-v', label: 'Bars - Vertical' },
                { id: 'bars-h', label: 'Bars - Horizontal' }
            ]
        }
    },
    computed: {
        ...mapModels(['LEDQuestionViews']),
        ...mapState('questions', ['questions']),
    }
}
</script>