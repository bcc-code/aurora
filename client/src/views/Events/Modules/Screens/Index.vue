<template>
    <section>
        <ViewToggle :activeView="view" @change="updateView"/>
        <component :is="view" :screens="screens" />
    </section>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import ViewToggle from '@/components/Screens/ViewToggle.vue'
import List from './List'
import Preview from './Preview'
export default {
    components: {
        ViewToggle,
        List,
        Preview
    },
    data: function() {
        return {
            view: 'list'
        }
    },
    computed: {
        ...mapState('screens', ['screens'])
    },
    async mounted(){
        await this.bindScreensRef();
    },
    methods: {
        ...mapActions('screens', ['bindScreensRef']),
        updateView(view) {
            this.view = view;
        }
    }
}
</script>