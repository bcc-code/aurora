<template>
    <section class="fixed inset-0 overflow-hidden" style="z-index:100">
        <div class="absolute inset-0 overflow-hidden">
            <transition name="fade">
                <div v-if="show" class="absolute inset-0 bg-dark-75 transition-opacity" @click="close"></div>
            </transition>
            <section class="absolute inset-y-0 right-0 pl-10 max-w-full flex" @click.stop>
                <transition name="slide">
                    <div v-if="show" class="relative w-full max-w-4xl ">
                        <transition name="fade">
                            <div class="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                                <button aria-label="Close panel" class="text-gray-300 hover:text-white transition ease-in-out duration-150" @click="close">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </transition>
                        <div class="h-full flex flex-col space-y-6 py-6 bg-background-1 shadow-xl overflow-y-scroll">
                            <div class="relative flex-1 px-4 sm:px-6">
                                <slot></slot>
                            </div>
                        </div>
                    </div>
                </transition>
            </section>
        </div>
    </section>
</template>
<script>
export default {
    props: ['open'],
    data() {
        return {
            closing: false
        }
    },
    computed: {
        show() {
            return this.open && !this.closing;
        }
    },
    methods: {
        close(){
            this.closing = true;
            setTimeout(() => { this.$emit('close'); this.closing = false }, 500);
        }
    }
}
</script>
<style scoped>
    .bg-dark-75 {
        background: linear-gradient(45deg, rgba(0, 0, 0, 0.6), rgba(54, 54, 54, 0.5));
        backdrop-filter: blur(3px);
    }

    .slide-enter-active, .slide-leave-active {
        @apply transform;
        @apply transition;
        @apply ease-in-out;
        @apply duration-500;
        @apply translate-x-0;
    }
    .slide-enter, .slide-leave-to {
        @apply translate-x-full;
    }
</style>