<template>
    <div class="DonateLower p-1 flex text-center">
        <div class="w-full shadow-text  leading-snug px-4 flex justify-center gap-5">
            <transition name="fade" mode="out-in">
                <div key="qrcode" class="relative bg-primary-dark bg-opacity-25 rounded-xl text-3xl leading-tight text-left" v-if="donationView == 'qrcode'">
                    <div class="w-full flex items-center justify-between">
                        <Vipps class="h-48 w-auto p-6"/>
                        <QRCode v-if="!isSmallWithResults" class="h-48 w-48 p-6"/>
                    </div>
                </div>
                <div key="results" class="relative bg-primary-dark bg-opacity-25 rounded-xl text-3xl leading-tight text-left"  v-if="donationView == 'results'">
                    <div class="w-full p-10 text-2xl text-center">
                        <p class="uppercase font-semibold">Status</p>
                        <p class="text-4xl font-semibold">{{collected.toLocaleString('nb-NO')}}</p>
                        <p>NOK</p>
                    </div>
                </div>
            </transition>
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
    props: ['donationView'],
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