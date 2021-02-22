<template>
    <section class="grid grid-cols-2 gap-2">
        <button class="btn btn-green w-full" :class="{'disabled': !canSave, 'col-span-2': !canRefresh }" @click="$emit('apply')">{{$t('screen.apply')}}</button>
        <button v-if="canRefresh" class="w-full btn btn-red" @click="$emit('refresh')">{{$t('screen.refresh')}}</button>
</section>
</template>
<script>
export default {
    props: {
        canRefresh: { type: Boolean, default: false },
        canSave: { type: Boolean, default: false }
    }
}
</script>