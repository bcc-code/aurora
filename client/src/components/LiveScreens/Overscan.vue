<template>
    <div v-if="showActionSafe || showTitleSafe" class="z-30 absolute w-full h-full" style="padding: 37.8px 67.2px;">
        <div class="w-full h-full border border-blue-800" style="padding: 16.2px 28.8px;">
            <div v-if="showTitleSafe" class="w-full h-full border border-green-800"></div>
        </div>
    </div>
</template>
<script>
export default {
    computed: {
        showActionSafe() {
            return this.$route.query != null && ('actionSafe' in this.$route.query) && this.$route.query.actionSafe !== 'false' && this.$route.query.actionSafe !== false
        },
        showTitleSafe() {
            return this.$route.query != null && ('titleSafe' in this.$route.query) && this.$route.query.titleSafe !== 'false' && this.$route.query.titleSafe !== false
        },
    }
}
</script>