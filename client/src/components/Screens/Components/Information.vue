<template>
    <Form :entity="model" grid :columns="1">
        <Field name="information" label="information" type="select" allowEmpty :options="informations" :select-label="(info) => info.content.substring(0, 30)" />
    </Form>
</template>
<script>
import { mapGetters } from 'vuex';
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
    computed: {
        ...mapGetters('contributions', ['informations'])
    }
}
</script>