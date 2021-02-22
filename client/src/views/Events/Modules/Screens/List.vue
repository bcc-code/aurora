<template>
    <section>
        <button class="btn btn-green h-10 float-right -mt-10 mb-3" @click="applyAll">{{$t('screen.apply-all')}}</button>
        <section class="w-full grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <ScreenManager v-for="screen in [...screens].sort((a, b) => a.order - b.order)" :key="screen.id" :screen="screen" :ref="`screen${screen.id}`" />
        </section>
    </section>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import ScreenManager from '@/components/Screens/Manager.vue'
export default {
    components: {
        ScreenManager
    },
    props: ['screens'],
    methods: {
        async applyAll(){
            await Promise.all(this.screens.map(screen => this.$refs[`screen${screen.id}`][0].apply()))
        }
    }
}
</script>