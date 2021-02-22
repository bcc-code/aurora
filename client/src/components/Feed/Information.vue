<template>
    <section>
        <div class="px-4 pb-4 text-white font-semibold" v-if="showTitle">
            <svg class="w-10" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20.375C16.1777 20.375 20.375 16.1777 20.375 11C20.375 5.82233 16.1777 1.625 11 1.625C5.82233 1.625 1.625 5.82233 1.625 11C1.625 16.1777 5.82233 20.375 11 20.375Z" stroke="currentColor" stroke-width="2.8125"/>
                <path d="M11 16.625V10.0625M11 8.1875V5.375V8.1875Z" stroke="currentColor" stroke-width="2.8125"/>
            </svg>
        </div>
        <div class="border-l-4 border-white shadow-text text-white leading-snug px-4 text-left" :class="textSize">
            <p class="font-semibold -mt-2">{{ informationNo }}</p>
            <p class="mt-2 italic -mb-2">{{ informationEn }}</p>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        information: {
            type: Object,
            required: true
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
            return this.information.content.split('//')[0]
        },
        informationEn() {
            return this.information.content.split('//')[1]
        },
        textSize() {
            switch(this.size) {
                case 'big':
                    return 'text-4xl px-4';
                default:
                    return 'text-xl px-2';
            }
        }
    },
}
</script>