<template>
    <Form :entity="model" grid :columns="1" label-root="competition">
        <div class="bg-background-2-plain p-2 rounded">
            <p><b>Position:</b> ({{model.x && model.x.toFixed(2)}}, {{model.y && model.y.toFixed(2)}})</p>
            <p><b>Scale:</b> {{model.zoom && model.zoom.toFixed(2)}}</p>
        </div>
        <Field name="selectedChurch" type="select" :options="churches" allowEmpty select-label="name" />
        <Field name="autoSpin" label="world.autoSpin" inline type="boolean" />
    </Form>
</template>
<script>
import ScreenManagerComponent from '@/mixins/ScreenManagerComponent'
import { mapState, mapActions } from 'vuex'
import EventBus from '@/utils/eventBus'
export default {
    mixins: [ScreenManagerComponent],
    computed: {
        ...mapState('competitions', ['churches']),
    },
    methods: {
        ...mapActions('competitions', ['bindChurchesRef']),
    },
    async mounted() {
        EventBus.$on('WWR_GLOBE_MOVE', (position) => { this.model = { ...this.model, ...position }});
        EventBus.$on('WWR_GLOBE_ZOOM', (zoom) => { this.model.zoom = zoom });
        await this.bindChurchesRef();
    }
}
</script>