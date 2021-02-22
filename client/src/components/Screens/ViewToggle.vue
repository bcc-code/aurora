<template>
    <section class="bg-background-2 text-sm text-gray-500 leading-none border-2 border-background-2-plain rounded-full inline-flex">
        <button v-for="view in views" :key="view.id" class="inline-flex items-center transition-colors duration-300 cursor-pointer ease-in focus:outline-none hover:text-tint-1 focus:text-tint-1 rounded-l-full px-4 py-2"
            :class="{ 'active': view.id == activeView }"
            @click="$emit('change', view.id)">
            <i :class="`fas fa-${view.icon} mr-2`"></i>
            <span>{{view.id | modelName }}</span>
        </button>
    </section>
</template>
<script>
export default {
    props: ['activeView'],
    data: function() {
        return {
            views: [
                { id: 'list', icon: 'list' },
                { id: 'preview', icon: 'desktop' }
            ]
        }
    }
}
</script>
<style>
    .active {
        @apply bg-background-2-light;
        @apply text-tint-1;
        @apply rounded-full;
    }
</style>
