<template>
    <OneColumn>
        <div class="w-full flex justify-between mb-3">
            <Title>{{$t('menu.template')}}</Title>
            <router-link :to="{ name: 'templates' }" class="text-base self-end"><i class="fas fa-long-arrow-alt-left mr-2"></i> Back to templates</router-link>
        </div>
        <Form v-if="$can('update', selectedTemplate)" :entity="selectedTemplate" grid :columns="2" label-root="template">
            <Field name="id" type="text" readonly />
            <Field name="background" type="text" class="col-span-full" />
            <Field name="logo" type="text" />
            <Field name="style.logo" type="textarea" />
            <Field name="style.primaryColor" type="text" />
            <Field name="style.primaryColorDark" type="text" />
        </Form>
        <div class="flex items-center justify-end">
            <button class="mt-3 btn btn-green" type="button"
                @click="updateTemplate(selectedTemplate).then(showSuccess)">
                {{$t('actions.save')}}
            </button>
        </div>
    </OneColumn>
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