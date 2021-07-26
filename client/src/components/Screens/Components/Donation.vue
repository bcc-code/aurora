<template>
    <Form :entity="model" grid :columns="1" label-root="screen">
        <Field v-if="$parent.$parent.screen.id == 'A'" name="showResults" inline type="boolean" />
        <Field v-else name="view" label="question.view" type="select" :options="views" select-key="id" select-label="label" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
    data: function () {
        return {
            views: [
                { id: "qrcode", label: "QR Code" },
                { id: "results", label: "Results" },
                { id: "qrresults", label: "Results & QR Code" },
            ]
        }
    }
}
</script>
