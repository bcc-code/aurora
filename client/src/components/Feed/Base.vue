<template>
    <Quote v-if="entry.type == ContributionTypes.QUOTE" :size="size" :quote="entry" />
    <Information class="m-2 mb-8" v-else-if="entry.type == ContributionTypes.INFORMATION" :size="size" :information="entry" />
    <Contribution v-else :contribution="entry" :size="size" :swap="swap" :orientation="orientation" :theme="theme" />
</template>
<script>
import Quote from './Quote.vue'
import Information from './Information.vue'
import Contribution from './Contribution.vue'
import { ContributionTypes } from '@/models/contribution.js'

export default {
    components: {
        Quote,
        Information,
        Contribution
    },
    props: ['entry', 'swap', 'orientation', 'size', 'theme'],
    computed: {
        ContributionTypes(){
            return ContributionTypes
        }
    }
}
</script>