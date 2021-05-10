<template>
    <section>
        <div class="px-4 pb-4 text-white font-semibold" v-if="showTitle">
        </div>
        <div class="border-l-4 border-white shadow-text text-white leading-snug px-4 text-left" :class="textSize">
            <p class="font-semibold -mt-2">{{ textContent.defaultText.defaultText.title }}</p>
            <p class="mt-2">{{ textContent.defaultText.defaultText.content }}</p>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        textContent: {
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
