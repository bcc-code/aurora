<template>
    <Contribution :entry="entry" :enableLightbox="true">
        <template v-slot:default>
            <div class="flex justify-evenly text-2xl px-6 py-2">
                <button type="button" @click.stop="rejectContribution"><i class="fas fa-trash-alt text-cerise"></i></button>
            </div>
        </template>
    </Contribution>
</template>

<script>
import { mapActions } from 'vuex'
import Contribution from './Contribution.vue'
export default {
    components: {
        Contribution
    },
    props: {
        entry: {
            type: Object,
            required: true
        },
    },
    methods: {
        ...mapActions('contributions', ['removeLiveRef']),

        async rejectContribution(){
            await this.removeLiveRef(this.entry)
        },
    }
}
</script>