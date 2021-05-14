<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <OneColumn v-else>
            <Form :entity="toExport" grid :columns="2" label-root="config" class="mb-5">
                <Field name="eventId" label="Event" :options="events" type="select" :selectLabel="label" selectKey="id" />
                <Field name="eventData" label="Event data" type="boolean" />
                <Field name="screens" label="Screen setup" type="boolean" />
                <Field name="liveboard" label="Liveboard" type="boolean" />
                <Field name="desk" label="Desk (unpublished)" type="boolean" />
                <Field name="program" label="Program" type="boolean" />
                <Field name="feed" label="Feed settings" type="boolean" />
                <Field name="gameboard" label="Gameboard settings (no responses)" type="boolean" />
            </Form>
            <div class="mt-4 md:flex md:items-center md:justify-between">
                <template v-if="!working">
                    <button class="btn btn-green" type="button" @click="exp">
                        Export
                    </button>
                </template>
                <template v-else>
                    Working ...
                </template>
                <div v-if="error">
                    {{ errror }}
                </div>
            </div>
        </OneColumn>
	</section>
</template>
<script>

import api from '@/utils/api';
import { mapState, mapActions } from 'vuex';

export default {
    data: function() {
        return {
            toExport: {
                eventId: null,
                eventData: true,
                screens: true,
                liveboard: true,
                desk: true,
                program: true,
                feed: true,
                gameboard: true,
            },
            working: false,
            loaded: false,
            error: null,
        }
    },
    computed: {
        ...mapState('events', ['events']),
        filteredEvents() {
            return this.events.filter((event) => event.archived == (this.selectedTab == 'archive'))
        }
    },
    created: async function() {
        await this.bindEvents();
        this.loaded = true;
    },
    methods: {
        ...mapActions('events', ['bindEvents']),
        label(x) {
            return x.name;
        },
        id(x) {
            return x.id;
        },
        async exp() {
            this.working = true;
            this.error = null;
            try {
                console.log(await api.exportData(this.toExport));
            } catch (e) {
                console.log(e);
                this.errror = e;
            } finally {
                this.working = false;
            }
        },
    },
}
</script>
