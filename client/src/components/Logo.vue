<template>
    <img :src="logoUrl" />
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('events', ['currentEvent']),
        currentEventGroup() {
            return {
                defaultLogo: null
            }
        },
        logoUrl() {
            if (this.showCustomBanner)
                return this.currentEvent.components.logoUrl
            else if (this.notNullOrEmpty(this.currentEventGroup.defaultLogo))
                return this.currentEventGroup.defaultLogo
            else return '/images/bcco_logo.svg'
        },
        showCustomBanner() {
            return this.currentEvent.components.banner && this.currentEvent.components.logoUrl;
        }
    },
    methods: {
        notNullOrEmpty(value) {
            return value != null && value.length > 0;
        }
    }
}
</script>