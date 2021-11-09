<template>
  <div class="w-full p-1 flex text-center">
        <div class="px-4 pb-4 text-white font-semibold">
            <svg class="w-10" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20.375C16.1777 20.375 20.375 16.1777 20.375 11C20.375 5.82233 16.1777 1.625 11 1.625C5.82233 1.625 1.625 5.82233 1.625 11C1.625 16.1777 5.82233 20.375 11 20.375Z" stroke="currentColor" stroke-width="2.8125"/>
                <path d="M11 16.625V10.0625M11 8.1875V5.375V8.1875Z" stroke="currentColor" stroke-width="2.8125"/>
            </svg>
        </div>
        <div class="w-full border-l-4 border-white shadow-text text-white leading-snug px-4 flex justify-center gap-5">
            <div :class="size =='small' ? showResults ? 'w-1/2' : 'w-full px-8' : 'w-2/3'">
                <template v-if="isSmallWithResults">
                    <p class="uppercase font-semibold text-3xl">Kollekt til BCC</p>
                </template>
                <template v-else>
                    <p class="uppercase font-semibold text-4xl pb-2">KOLLEKT TIL BCC</p>
                </template>
                <div class="relative bg-black bg-opacity-25 rounded-xl text-3xl leading-tight text-left">
                    <div class="flex flex-wrap items-center justify-center">
                        <p class="py-5 px-2 leading-snug text-4xl text-center">Bidra på <strong class="italic">donation.bcc.no</strong><br>eller<br>via <strong class="italic">BrunstadTV-appen</strong></p>
                    </div>
                </div>
            </div>
            <div v-if="showResults" :class="size =='small' ? 'w-1/2': 'w-1/3'">
                <p class="uppercase font-semibold text-3xl pb-2">Status</p>
                <div class="h-48 w-full bg-black bg-opacity-25 rounded-xl text-4xl leading-tight text-center pt-12">
                    <div class="">
                        <p class="font-semibold">{{collected.toLocaleString('nb-NO')}}</p>
                        <p>NOK</p>
                    </div>
                </div>
            </div>
        </div>
  </div>
</template>

<script>
import QRCode from '@/components/LiveScreens/TV/ScreenA/Donation/QRcode.vue'
import Vipps from '@/components/LiveScreens/TV/ScreenA/Donation/Vipps.vue'
import { crono } from 'vue-crono';
import Api from '@/utils/api.js';
export default {
    components: {
      QRCode,
      Vipps
    },
    mixins: [crono],
    props: ['size', 'showResults'],
    data: function(){
        return {
            collected: 0,
        }
    },
    created: async function() {
        await this.updateCollected();
    },
    computed: {
        isSmallWithResults() {
            return this.size == 'small' && this.showResults
        }
    },
    methods: {
        async updateCollected() {
            await Api.collectionResults().then((result) => {
                this.collected = result.data
            })
        }
    },
    cron: {
        time: 10000,
        method: 'updateCollected'
    }
}
</script>
