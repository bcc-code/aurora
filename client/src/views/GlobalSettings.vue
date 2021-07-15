<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <OneColumn v-else>
            <Form :entity="data" grid :columns="2" label-root="config" class="mb-5">
                <Field name="btv.canCheckin" label="Show live event in APP" type="boolean" inline />
                <p>Note: If the user is already checked in this has no effect before app v3.6.3</p>
                <Field v-if="screenEventEnabled" name="screen.eventId" label="Event for screens" :options="filteredEvents" type="select" :selectLabel="label" selectKey="id" />
            </Form>
            <button class="btn btn-green" type="button" @click="saveSettings">
                {{$t('actions.save')}}
            </button>
        </OneColumn>
	</section>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { getRemoteConfig, getValue } from "firebase/remote-config";
import firebase from 'firebase/remote-config'

export default {
    data: function() {
        return {
            loaded: false,
            data: {
                btv: {},
                screen: {},
            },
            remoteConfig: null,
            screenEventEnabled: false,
        }
    },
    methods: {
        ...mapActions('configs', ['bindConfigRef']),
        ...mapActions('events', ['bindEvents']),
        async saveSettings() {
            await this.btvConfigRef.set(this.data.btv);
            await this.screenConfigRef.set(this.data.screen)
        },
        label(x) {
            return x.name;
        },

        id(x) {
            return x.id;
        },
    },
    computed: {
        ...mapGetters('configs', ['btvConfigRef', 'screenConfigRef']),
        ...mapState('events', ['events']),
        filteredEvents() {
            return this.events.filter((event) => event.archived == (this.selectedTab == 'archive'))
        }
    },
    async mounted(){
        await this.bindEvents();
        this.data.btv = (await this.btvConfigRef.get()).data();
        this.data.screen = (await this.screenConfigRef.get()).data() ?? {};
        this.loaded = true;
    },
}
</script>
