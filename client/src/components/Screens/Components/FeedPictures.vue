<template>
    <Form :entity="model" grid :columns="1" label-root="screen">
        <Field name="view" type="select" :options="['slideshow', 'grid']" />
        <Field v-if="model.view == 'grid'" name="columns" type="number" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
export default {
    mixins: [ScreenManagerComponent]
}
</script>