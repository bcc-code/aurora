<template>
    <section class="p-2 mb-4">
        <div class="shadow-text rounded-xl text-white leading-tight p-8 text-center" :class="textSize">
            <p class="font-semibold">{{ quote.source }}</p>
            <p class="mb-4 my-5">{{ quote.content }}</p>
            <p class="italic" :class="authorSize">{{ quote.author }}</p>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        quote: {
            type: Object,
            required: true
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
                    return 'text-3xl';
                default:
                    return 'text-xl';
            }
        },
        authorSize() {
            switch(this.size) {
                case 'big':
                    return 'text-2xl';
                default:
                    return 'text-lg';
            }
        }
    }
}
</script>