<template>
    <section class="w-full flex justify-start items-center text-left">
        <div class="NOW flex-1 px-2 text-3xl leading-tight">
            <p class="text-2xl">Nå:</p>
            <p class="font-semibold">{{currentEvent.name}}</p>
            <p class="font-semibold opacity-75">{{currentEvent.details}}</p>
        </div>
        <div class="NEXT flex-1 px-2 text-3xl leading-tight" v-if="currentEvent.nextEvent != null">
            <p class="text-2xl">Neste:</p>
            <p class="font-semibold">{{currentEvent.nextEvent.name}}</p>
            <p class="font-semibold opacity-75">{{currentEvent.nextEvent.details}}</p>
        </div>
    </section>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('events', ['currentEvent']),
    },
}
</script>
