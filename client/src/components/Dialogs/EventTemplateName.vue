<template>
    <Dialog>
        <template v-slot:header>
            <p>Give a name to the template</p>
        </template>
        <template v-slot:body>
            <Form :entity="newTemplate" label-root="template">
                <Field name="name" hideLabel type="text" />
                <p class="py-2">Or use an existing template</p>
                <Field name="overwrite" hideLabel allowEmpty type="select" select-key="id" select-label="id" :options="templates" />
            </Form>
        </template>
        <template v-slot:footer>
            <button @click.stop="$emit('cancel')" class="flex-no-shrink text-white py-2 px-4 rounded bg-gray-600 hover:bg-gray-500">{{$t('actions.cancel')}}</button>
            <button @click.stop="$emit('confirm', newTemplateName)" class="flex-no-shrink text-white py-2 px-4 rounded bg-red-600 hover:bg-red-500">{{$t('actions.save')}}</button>
        </template>
    </Dialog>
</template>
<script>
import { mapState } from 'vuex'
import Dialog from './Dialog'
export default {
    components: {
        Dialog
    },
    data: function () {
        return {
            newTemplate: {
                name: null,
                overwrite: null
            }
        }
    },
    computed: {
        ...mapState('templates', ['templates']),
        newTemplateName() {
            return this.newTemplate.overwrite || this.newTemplate.name
        }
    }
}
</script>
<style scoped>
.bg-dark-75 {
    background: #00000075;
}
</style>