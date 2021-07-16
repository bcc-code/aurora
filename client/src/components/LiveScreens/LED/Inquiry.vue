<template>
    <div class="Inquiry relative p-12 text-white leading-tight flex flex-col justify-center items-center w-full h-full overflow-hidden">
        <transition name="fade" mode="out-in">
            <div v-if="currentInquiry != null" class="relative text-center flex flex-col items-center justify-center px-24">
                <h1 class="text-6xl font-bold">{{ currentInquiry.text }}</h1>
                <h3 class="text-4xl">{{currentInquiry.displayName}} - {{currentInquiry.churchName}}, {{currentInquiry.countryName}}</h3>
            </div>
        </transition>
    </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
    props: ['event'],
    computed: {
        currentInquiry: function() {
            if (!this.event.currentInquiry) {
                return null
            }
            return this.event.currentInquiry
        },
    },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.Inquiry {
  text-shadow: 0 1px 2px rgba(0,0,0,.4);
}
</style>
