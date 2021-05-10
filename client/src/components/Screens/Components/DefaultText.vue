<template>
    <Form :entity="model" grid :columns="1">
        <Field name="defaultText" label="defaultText" type="select" allowEmpty :options="defaultTexts" :select-label="(t) => t.content.substring(0, 30)" />
    </Form>
</template>
<script>
import { mapGetters } from 'vuex';
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
    computed: {
        ...mapGetters('contributions', ['defaultTexts'])
    }
}
</script>
