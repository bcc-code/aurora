<template>
    <section class="xl:w-2/3 mx-auto">
        <Form v-if="$can('update', selectedTemplate)" :entity="selectedTemplate" grid label-root="event-template">
            <Field name="name" label="name" type="text" class="col-span-1" />
            <Field name="canCheckin" inline type="boolean" class="col-start-3" />
            <Field name="defaultBackground" type="text" class="col-span-full" />
            <Field name="defaultLogo" type="text" class="col-span-2" />
            <div class="flex items-center justify-end">
                <button class=" mt-3 shadow bg-teal-500 hover:bg-teal-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button"
                    @click="updateTemplate(selectedTemplate)">
                    {{$t('actions.save')}}
                </button>
            </div>
        </Form>
    </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
    computed: {
        ...mapGetters('templates', ['selectedTemplate'])
    },
    created: async function(){
        this.$store.commit('events/setSelectedEventId', null);
        this.$store.commit('templates/setSelectedTemplateId', this.$route.params.templateId);
    },
    methods: {
        ...mapActions('templates', ['updateTemplate'])
    }
}
</script>