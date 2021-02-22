<template>
	<div v-if="currentInquiry != null"
    style="margin-bottom: 103px; margin-left: 200px; margin-right: 200px; width: 1520px; height:185px;"
    class="text-left absolute bottom-0 px-20 flex w-full justify-start bg-primary-dark rounded-xl">
        <div class="mr-2 font-semibold">
            <div class="pr-10 pt-5">
                <transition name="fade" mode="out-in">
                    <div :key="currentInquiry.text">
                        <div class="w-full">{{currentInquiry.text}}</div>
                        <div class="text-gray-400">{{currentInquiry.displayName}} - {{currentInquiry.churchName}}, {{currentInquiry.countryName}}</div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('inquiries', ['currentInquiry']),
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
</style>