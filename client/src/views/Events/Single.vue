<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <router-view v-else/>
	</section>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
export default {
    data: function() {
        return {
            loaded: false,
        }
    },
    methods: {
        ...mapActions('events', ['bindEventsRef'])
    },
    async mounted(){
        this.$store.commit('events/setSelectedEventId', this.$route.params.eventId);
        await this.bindEventsRef().then(() => {
            this.loaded = true;
        })
    },
}
</script>