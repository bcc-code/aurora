<template>
    <section>
        <div :class="['overflow-hidden bg-light rounded-xl']">
            <div :class="['ml-0 border-orange pt-3 pb-6 border-l-xl']">
                <div class="font-semibold leading-tight text-left" :class="[textSize, 'pl-4 pr-8']">
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
