<template>
    <Form :entity="model" grid :columns="1" label-root="world">
        <Field name="mapUrl" type="text" />
        <Field name="markersColor" type="text" />
        <Field name="showCheckinsNumber" label="screen.showCheckins" inline type="boolean" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent],
}
</script>