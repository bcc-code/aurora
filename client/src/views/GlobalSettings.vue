<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <OneColumn v-else>
            <Form :entity="data" grid :columns="2" label-root="config" class="mb-5">
                <Field name="canCheckin" label="Show live event in APP" type="boolean" inline />
                <p>Note: If the user is already checked in this has no effect before app v3.6.3</p>
                <Field name="screen.eventId" label="Event for screens" :options="filteredEvents" type="select" :selectLabel="label" selectKey="id" />
                <Field name="screen.debug" label="Show debug info on screens" type="boolean" inline />
            </Form>
            <button class="btn btn-green" type="button" @click="saveSettings">
                {{$t('actions.save')}}
            </button>
        </OneColumn>
	</section>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
export default {
    data: function() {
        return {
            loaded: false,
            data: {
                btv: {},
                screen: {},
            },
            remoteConfig: null,
        }
    },
    methods: {
        ...mapActions('configs', ['bindConfigRef']),
        async saveSettings() {
            await this.btvConfigRef.set(this.data);
        }
    },
    computed: {
        ...mapGetters('configs', ['btvConfigRef', 'btvConfig']),
    },
    async mounted(){
        await this.bindConfigRef();
        this.data = (await this.btvConfigRef.get()).data();
        this.loaded = true;
    },
}
</script>
