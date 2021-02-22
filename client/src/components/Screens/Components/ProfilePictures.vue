<template>
    <Form :entity="model" grid :columns="1" label-root="event">
        <Field name="frequency" label="event.switchRate" type="number"/>
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent]
}
</script>