<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <OneColumn v-else>
        <OneColumn>
        <h2>Export</h2>
            <Form :entity="toExport" grid :columns="2" label-root="config" class="mb-5">
                <Field name="eventId" label="Event" :options="events" type="select" :selectLabel="label" selectKey="id" />
                <Field name="exportName" label="Export Name" type="text" pattern="[A-Za-z]+" />
                <Field name="eventData" label="Event config" type="boolean" />
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
        <OneColumn>
        <h2>Import</h2>
            <Form :entity="toImport" grid :columns="2" label-root="config" class="mb-5">
                <Field name="eventId" label="Event" :options="events" type="select" :selectLabel="label" selectKey="id" />
                <Field name="importFrom" label="Data Source" type="select" :options="exportsList" />
                <Field name="eventData" label="Event config" type="boolean" />
                <Field name="screens" label="Screen setup" type="boolean" />
                <Field name="liveboard" label="Liveboard" type="boolean" />
                <Field name="clearLiveboard" label="Delete liveboard" type="boolean" />
                <Field name="desk" label="Desk (unpublished)" type="boolean" />
                <Field name="clearDesk" label="Delete desk" type="boolean" />
                <Field name="program" label="Program" type="boolean" />
                <Field name="clearProgram" label="Delete program" type="boolean" />
                <Field name="feed" label="Feed settings" type="boolean" />
                <Field name="clearFeed" label="Delete feed" type="boolean" />
                <Field name="gameboard" label="Gameboard settings (no responses)" type="boolean" />
                <Field name="clearGameboard" label="Delete gameboard" type="boolean" />
            </Form>
            <div class="mt-4 md:flex md:items-center md:justify-between">
                <template v-if="!working">
                    <button class="btn btn-green" type="button" @click="imp">
                       Import
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
            toImport: {
                eventId: null,
                eventData: true,
                screens: true,
                liveboard: true,
                clearLiveboard: false,
                desk: true,
                clearDesk: false,
                program: true,
                clearProgram: false,
                feed: true,
                clearFeed: false,
                gameboard: true,
                clearGameboard: false,
            },
            working: false,
            loaded: false,
            error: null,
            exportsList: [],
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
        this.exportsList = (await api.listExports()).data.exportNames;
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
                await api.exportData(this.toExport);
                this.exportsList = (await api.listExports()).data.exportNames;
            } catch (e) {
                console.log(e);
                this.errror = e;
            } finally {
                this.working = false;
            }
        },

        async imp() {
            this.working = true;
            this.error = null;
            try {
                console.log(await api.importData(this.toImport));
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
