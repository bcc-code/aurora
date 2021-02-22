<template>
    <div class="w-full h-84 my-12 pl-2 pr-4">
        <div class="w-full h-full pb-2">
            <div class="h-full rounded-xl m-2 mb-8 bg-primary overflow-hidden">
                <div class="text-white leading-tight py-6 px-8 text-left"> 
                    <p class="font-semibold text-4xl">KOLLEKT</p>
                    <p class="opacity-50 text-3xl" >til BCC</p>
                </div>
                <div class="bg-primary-dark h-full py-16 px-24 shadow-top">
                    <div class="mb-8 whitespace-no-wrap">
                        <p class="text-5xl italic">donation.bcc.no</p>
                    </div>
                    <QRcode />
                    <div class="mb-8 whitespace-no-wrap">
                        <div class="text-5xl font-semibold leading-none">Scan QR-koden</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QRcode from './Donation/QRcode.vue'
import Vipps from './Donation/Vipps.vue'
export default {
    components: {
        QRcode,
        Vipps
    },
}
</script>