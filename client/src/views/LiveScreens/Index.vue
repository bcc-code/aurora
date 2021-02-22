<template>
    <Screen v-if="loaded" :screen="screen" :customStyle="currentEvent.style" />
</template>
<script>
import { mapGetters, mapActions } from 'vuex' 

import Screen from '@/components/LiveScreens/Screen'
export default {
    components: {
        Screen
    },
    data: function(){
        return {
            loaded: false
        }
    },
    computed: {
        ...mapGetters('screens', ['currentScreenFromId']),
        ...mapGetters('events', ['currentEvent']),
        screen(){
            var tryFindScreen = this.currentScreenFromId(this.$route.params.id);
            return tryFindScreen == null ? { id: 0, size: { height: 0, width: 0 }} : tryFindScreen;
        },
    },
    async mounted(){
        await this.bindCurrentScreensRef().then(async () => {
            this.loaded = true;
        })
    },
    methods: {
        ...mapActions('screens', ['bindCurrentScreensRef']),
    },
}
</script>