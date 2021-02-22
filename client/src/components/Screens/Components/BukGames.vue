<template>
    <Form :entity="model" grid :columns="1">
        <Field name="game" label="game" type="select" :options="games" select-key="id" select-label="label" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
    data: function() {
        return {
            games: [
                { id: "SUPERPIXEL", label: "Super Pixel" },
                { id: "BUKRACE", label: "BUK Race" }
            ]
        }
    }
}
</script>