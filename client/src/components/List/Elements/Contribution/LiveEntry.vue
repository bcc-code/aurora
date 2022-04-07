<template>
    <Contribution :entry="entry" :enableLightbox="true">
        <template v-slot:default>
            <div class="flex justify-evenly text-2xl px-6 py-2">
                <button type="button" @click.stop="showRemoveConfirm = true"><i class="fas fa-trash-alt text-cerise"></i></button>
            </div>
            <Confirm v-if="showRemoveConfirm" @cancel="showRemoveConfirm = false" @confirm="rejectContribution" :message="$t('dialogs.confirm-delete-contribution')" />
        </template>
    </Contribution>
</template>

<script>
import { mapActions } from 'vuex'
import Contribution from './Contribution.vue'
import Confirm from '@/components/Dialogs/Confirm.vue'
export default {
    components: {
        Contribution,
        Confirm
    },
    props: {
        entry: {
            type: Object,
            required: true
        },
    },
    data: function(){
        return {
            showRemoveConfirm: false
        }
    },
    methods: {
        ...mapActions('contributions', ['removeLiveRef', 'updateContribsCount']),

        async rejectContribution(){
            await this.removeLiveRef(this.entry)
            await this.updateContribsCount(-1) // Decrement counter
        },
    }
}
</script>
