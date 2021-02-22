<template>
    <section class="w-full">
        <nav class="flex space-x-4" aria-label="Tabs">
            <button  v-for="tab in tabs" :key="tab"
                class="py-2 px-6 text-center font-medium text-sm rounded-full text-white focus:ring-none focus:outline-none"
                :class="[selected == tab ? 'border-2 border-white border-opacity-10 bg-white bg-opacity-10' : 'text-opacity-50']"
                @click="$emit('select', tab)">
                {{tab | capitalize}}
            </button>
        </nav>
    </section>
</template>
<script>
export default {
    props: {
        tabs: { type: Array, default: () => [] },
        selected: { type: String, default: '' }
    },
    computed: {
        widthClass() {
            const classes = ['w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-1/5', 'w-1/6']
            return this.tabs.length ? classes[this.tabs.length - 1] : 'w-full'
        }
    }
}
</script>