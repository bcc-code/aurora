<template>
    <img :src="logoUrl" />
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('events', ['selectedEvent', 'currentEvent']),
        logoUrl() {
            const event = this.selectedEvent || this.currentEvent;
            if (this.notNullOrEmpty(event.logo.computedValue))
                return event.logo.computedValue;
            return '/images/bcco_logo.svg'
        },
    },
    methods: {
        notNullOrEmpty(value) {
            return value != null && value.length > 0;
        }
    }
}
</script>