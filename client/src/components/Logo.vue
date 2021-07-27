<template>
    <img :src="logoUrl" />
</template>
<script>
export default {
    props: ['event'],
    computed: {
        logoUrl() {
            if (this.notNullOrEmpty(this.event?.logo?.computedValue))
                return this.event.logo.computedValue;
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