<template>
    <Form :entity="selectedQuestion" label-root="question">
        <Field name="url" type="text" />
        <Field name="icon" type="select" :options="icons" />
    </Form>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    data: function () {
        return {
            icons: ['information', 'url', 'game', 'donation', 'survey']
        }
    },
    computed: {
        ...mapGetters('questions', ['selectedQuestion'])
    },
    methods: {
        async save() {
            return;
        }
    }
}
</script>