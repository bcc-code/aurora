<template>
    <section class="w-full grid grid-cols-4 gap-4">
        <div class="col-span-full my-3">
            <nav class="flex flex-col sm:flex-row">
                <button v-for="screen in screens" :key="screen.id" class="w-1/2 py-2 block"
                    :class="selectedScreenId == screen.id ? 'bg-seagull rounded-full font-medium' : 'text-white'"
                    @click="selectedScreenId = screen.id">
                    {{$t('menu.screen')}} {{screen.id}}
                </button>
            </nav>
        </div>
        <section class="col-span-full lg:col-span-1">
            <ScreenManager :screen="selectedScreen" />
        </section>
        <section class="col-span-full lg:col-span-3 relative" v-if="previewScreen != null" ref="preview" :style="{ paddingTop: paddingTop }">
            <PreviewScreen :screen="previewScreen"
                :overrideEvent="selectedEvent"
                :style="{ transform: `scale(${scale})` }"
                style="transform-origin: top left;" />
        </section>
    </section>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import PreviewScreen from '@/components/LiveScreens/Screen'
import ScreenManager from '@/components/Screens/Manager'
export default {
    components: {
        ScreenManager,
        PreviewScreen
    },
    props: ['screens'],
    data: function() {
        return {
            selectedScreenId: null,
            width: 0,
            previewScreen: null
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        handleResize() {
            if (this.$refs.preview != null)
                this.width = this.$refs.preview.clientWidth;
        },
        updatePreviewScreen() {
            this.previewScreen = this.selectedScreen != null
                ? { ...this.selectedScreen, id: this.selectedScreen.id, options: this.screenPreviewOptions }
                : null
        }
    },
    computed: {
        ...mapGetters('events', ['selectedEvent']),
        ...mapState('screens', ['screenPreviewOptions']),
        selectedScreen() {
            if (this.selectedScreenId == null)
                return null
            return this.screens.find((screen) => screen.id == this.selectedScreenId);
        },
        paddingTop() {
            if (this.selectedScreen == null)
                return '0'
            return `${Math.round(100*this.selectedScreen.size.height / this.selectedScreen.size.width)}%`
        },
        scale() {
            if (this.selectedScreen == null)
                return 0;
            return this.width / this.selectedScreen.size.width;
        },
    },
    watch: {
        'selectedScreen.id': {
            handler() {
                this.previewScreen = null;
                this.$nextTick(function () {
                    this.handleResize();
                    this.updatePreviewScreen();
                })
            }
        },
        screenPreviewOptions: {
            deep: true,
            handler() {
                this.updatePreviewScreen();
            }
        }
    }
}
</script>
