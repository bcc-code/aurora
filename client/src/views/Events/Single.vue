<template>
    <section class="max-w-screen-xl mx-auto">
        <template v-if="!loaded" />
        <router-view v-else/>
	</section>
</template>
<script>
import { mapActions } from 'vuex';
export default {
    data: function() {
        return {
            loaded: false,
        }
    },
    methods: {
        ...mapActions('events', ['bindEvents']),
        ...mapActions('screens', ['bindScreens'])
    },
    async mounted(){
        this.$store.commit('events/setSelectedEventId', this.$route.params.eventId);
        await this.bindEvents()
        await this.bindScreens()
        this.loaded = true;
    },
}
</script>