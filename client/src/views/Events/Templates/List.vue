<template>
    <section class="xl:w-2/3 mx-auto">
        <List :elements="templates" :multiLang="false">
            <template v-slot:list="{ elements, searchQuery }">
                <EventTemplate v-for="template in elements" :key="template.id" :template="template" :searchQuery="searchQuery"/>
            </template>
        </List>
    </section>
</template>

<script>
import { mapState } from 'vuex';
import EventTemplate from '@/components/List/Elements/Template.vue'
import List from '@/components/List/List.vue'

export default {
    components: {
        List,
        EventTemplate
    },
    computed: {
        ...mapState('templates', ['templates']),
    },
    created: function(){
        this.$store.commit('events/setSelectedEventId', null);
        this.$store.commit('templates/setSelectedTemplateId', null);
    },
}
</script>