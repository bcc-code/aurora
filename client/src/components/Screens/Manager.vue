<template>
    <div class="bg-background-2-plain rounded overflow-hidden">
        <div class="bg-background-2-light p-5 h-16 uppercase tracking-wide font-bold">
            <template v-if="screen != null">{{$t('menu.screen')}} {{screen.id}}</template>
        </div>
        <section v-if="screen == null" class="py-56 text-center">{{$t('screen.no-screen')}}</section>
        <component v-else class="p-5" :is="`Screen${screenGroup}`" :screen="screen" :key="`screen-${screen.id}`" :ref="`screen-${screen.id}`"/>
    </div>
</template>

<script>
import ScreenA from './Managers/ScreenA'
import ScreenF from './Managers/ScreenF'
import ScreenLR from './Managers/ScreenLR'
import ScreenM from './Managers/ScreenM'
import ScreenE from './Managers/ScreenE'
export default {
    props: ['screen'],
    components: {
        ScreenA,
        ScreenF,
        ScreenLR,
        ScreenE,
        ScreenM
    },
    computed: {
        screenGroup() {
            switch(this.screen.id[0]) {
                case 'L':
                case 'R':
                    return 'LR';
                default:
                    return this.screen.id[0]
            }
        }
    },
    methods: {
        async apply(){
            await this.$refs.screen.apply()
        }
    }
}
</script>