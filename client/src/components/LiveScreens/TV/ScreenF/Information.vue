<template>
    <section v-if="information != null && information != ''">
        <div :class="['text-left mb-2 flex items-center', size === 'big' ? 'ml-9' : 'ml-6']">
            <svg class="-mb-1 h-6 relative" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20.375C16.1777 20.375 20.375 16.1777 20.375 11C20.375 5.82233 16.1777 1.625 11 1.625C5.82233 1.625 1.625 5.82233 1.625 11C1.625 16.1777 5.82233 20.375 11 20.375Z" stroke="currentColor" stroke-width="2.8125"/>
                <path d="M11 16.625V10.0625M11 8.1875V5.375V8.1875Z" stroke="currentColor" stroke-width="2.8125"/>
            </svg>
            <span :class="['font-semibold', textSize, size === 'big' ? 'px-2' : 'px-1']">Informasjon</span>
        </div>
        <div :class="['overflow-hidden bg-light', size == 'big' ? 'rounded-xl' : 'rounded-xl']">
            <div :class="['ml-0 border-orange', size === 'big' ? 'pt-5 pb-10 border-l-2xl ' : 'pt-3 pb-6 border-l-xl ']">
                <div class="font-semibold leading-tight text-left" :class="[textSize, size == 'big' ? 'pl-4 pr-10' : 'pl-2 pr-8']">
                    <p class="text-dark-blue">{{ informationNo }}</p>
                    <p class="text-redish mt-2 italic ">{{ informationEn }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        information: {
            type: Object | String,
            default: () => {}
        },
        showTitle: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'normal'
        }
    },
    computed: {
        informationNo() {
            return this.information.content && this.information.content.split('//')[0]
        },
        informationEn() {
            return this.information.content && this.information.content.split('//')[1]
        },
        textSize() {
            switch(this.size) {
                case 'big':
                    return 'text-3xl';
                default:
                    return 'text-xl';
            }
        }
    },
}
</script>