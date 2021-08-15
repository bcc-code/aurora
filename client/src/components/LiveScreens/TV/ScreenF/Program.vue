<template>
	<div
    v-if="upcoming.length > 0"
    style="margin-bottom: 103px; margin-left: 200px; width: 1720px; height:155px;"
    class="program text-left absolute bottom-0 pl-20 flex w-full justify-start bg-primary-dark rounded-l-xl overflow-hidden">
        <transition-group
        tag="div"
        name="slide-up"
        class="text-4xl flex flex-no-wrap whitespace-no-wrap items-center text-white">
                <div class="program-item mr-2 flex-shrink-0"
                    :class="{ 'program-item-current font-semibold': isCurrent(programElement)}"
                    v-for="programElement in upcoming"
                    :key="programElement.id">
                    <img class="h-11 inline-block mr-1 -mt-3 max-w-full"
                        :src="`/images/timeline/${ProgramElementTypeLabel[programElement.type].toLowerCase().trim()}.svg`"
                        style="filter: invert(1)" />
                    <div class="inline-block  pr-10">
                        {{inLanguage(programElement, language)}}
                    </div>
                </div>
        </transition-group>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Translation from '@/mixins/translation.js'
import { ProgramElementTypeLabel } from '@/models/program.js'
export default {
    mixins: [Translation],
    props: ['event'],
    computed: {
        ...mapGetters('program', ['upcoming', 'currentProgramElement']),
        ...mapGetters('events', ['currentEvent']),
        ProgramElementTypeLabel(){
            return ProgramElementTypeLabel;
        }
    },
    methods: {
        ...mapActions('program', ['bindProgramRef', 'bindEvent']),
        isCurrent(programElement){
            return this.currentProgramElement != null && programElement.id == this.currentProgramElement.id;
        }
    },
    async mounted(){
        await this.bindEvent(this.event.id);
        await this.bindProgramRef(this.event.id);
    }
}
</script>
<style scoped>
.program:after {
    content:"";
    position:absolute;
    top:0;
    right:0;
    height:100%;
    width:20%;
    background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0, 0.4));
}
.program-item {
    transition: all 2s, font-weight 1ms;
}
.slide-up-leave-active {
    position:absolute;
}
.program-item-current.slide-up-enter, .slide-up-leave-to {
    opacity: 0;
    transform: translateX(-100%)
}
</style>
