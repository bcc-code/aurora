<template>
    <section v-if="information != null && information != ''">
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