<template>
    <section class="max-w-screen-xl mx-auto">

<div class="grid grid-cols-1 md:grid-cols-4 gap-1 mb-5">
    <div v-for="s in screenList" key="s">
        <a :href="'/screens/' + s" class="flex flex row items-start rounded-lg bg-clay p-2 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline">
            <div class="bg-bluewood text-white rounded-lg p-3 h-12 w-12 text-center">
                <i class="fa fa-th"></i></div>
            <div class="ml-3">
                <p class="font-semibold">Screen {{ s }}</p>
            </div>
        </a>
    </div>
</div>

        <template v-if="!loaded" />
        <OneColumn v-else>
            <Form :entity="data" grid :columns="2" label-root="config" class="mb-5">
                <Field name="btv.canCheckin" label="Show live event in APP" type="boolean" inline />
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
import { mapActions, mapGetters, mapState } from 'vuex';
export default {
    data: function() {
        return {
            loaded: false,
            data: {
                btv: {},
                screen: {},
            },
            remoteConfig: null,
            screenList: ['A', 'E', 'E2', 'F', 'L', 'M', 'R'],
        }
    },
    methods: {
        ...mapActions('configs', ['bindConfigRef']),
        ...mapActions('events', ['bindEvents']),
        async saveSettings() {
            await this.btvConfigRef.set(this.data.btv);
            await this.screenConfigRef.set(this.data.screen);
        },
        label(x) {
            return x.name;
        },

        id(x) {
            return x.id;
        },
    },
    computed: {
        ...mapGetters('configs', ['btvConfigRef', 'btvConfig', 'screenConfig', 'screenConfigRef']),
        ...mapState('events', ['events']),
        filteredEvents() {
            return this.events.filter((event) => event.archived == (this.selectedTab == 'archive'))
        },
    },
    async mounted(){
        await this.bindConfigRef();
        await this.bindEvents();
        this.data.btv = (await this.btvConfigRef.get()).data();
        this.data.screen = (await this.screenConfigRef.get()).data();
        this.loaded = true;
    },
}
</script>
