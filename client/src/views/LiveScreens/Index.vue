<template>
    <Screen v-if="loaded" :screen="screen" :defaultBackground="currentEvent.background.computedValue" :customStyle="customStyle" />
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
        customStyle() {
            return {
                primaryColor: this.currentEvent.style.primaryColor.computedValue,
                primaryColorDark: this.currentEvent.style.primaryColorDark.computedValue,
                logo: this.currentEvent.style.logo.computedValue
            }
        }
    },
    async mounted(){
        await this.bindCurrentScreens().then(async () => {
            this.loaded = true;
        })
    },
    methods: {
        ...mapActions('screens', ['bindCurrentScreens']),
    },
}
</script>