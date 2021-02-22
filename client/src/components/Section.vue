<template>
    <section class="section mb-6 relative" :class="classes">
        <slot />
    </section>
</template>

<script>
export default {
    props: {
        highlight: {
            type: Boolean
        },
        round: {
            type: Boolean
        },
        full: {
            type: Boolean
        }
    },
    computed: {
        classes() {
            var result = "";
            if (this.highlight) result += 'py-5 px-5 bg-background-2 '
            if (this.round) result += 'rounded-lg '
            result += (this.full) ? '-mx-5 sm:mx-auto sm:max-w-lg' : 'mx-auto max-w-lg'
            return result
        }
    }
}
</script>