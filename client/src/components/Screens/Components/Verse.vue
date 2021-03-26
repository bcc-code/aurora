<template>
    <Form :entity="model" grid :columns="1" label-root="screen">
        <Field name="displayTime" label="Display For (seconds)" type="number" />
        <Field name="displayPrevious" label="Display previous" inline type="boolean" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
}
</script>
