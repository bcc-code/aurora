<template>
    <Dialog>
        <template v-slot:header>
            <h1 class="text-xl">{{$t('dialogs.are-you-sure')}}</h1>
        </template>
        <template v-slot:body>
            <p>{{message ? message : $t('dialogs.confirm-action')}}</p>
        </template>
        <template v-slot:footer>
            <button @click.stop="$emit('cancel')" class="flex-no-shrink text-white py-2 px-4 rounded bg-gray-600 hover:bg-gray-500">{{$t('actions.cancel')}}</button>
            <button @click.stop="$emit('confirm')" class="flex-no-shrink text-white py-2 px-4 rounded bg-red-600 hover:bg-cerise">{{$t('actions.confirm')}}</button>
        </template>
    </Dialog>
</template>
<script>
import Dialog from './Dialog'
export default {
    components: {
        Dialog
    },
    props: ['message']
}
</script>