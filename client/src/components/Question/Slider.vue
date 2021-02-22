<template>
    <Form :entity="selectedQuestion.slider" grid :columns="2" label-root="question.slider">
        <Field name="minValue" type="number" />
        <Field name="maxValue" type="number" />
        <Field name="step" type="number" />
        <Field name="correct" type="number" />
    </Form>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('questions', ['selectedQuestion'])
    },
    methods: {
        async save() {
            const { slider } = this.selectedQuestion
            slider.minValue = parseInt(slider.minValue)
            slider.maxValue = parseInt(slider.maxValue)
            slider.step = parseInt(slider.step)
        }
    }
}
</script>