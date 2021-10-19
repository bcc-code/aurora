<template>
    <section v-if="loaded" class="absolute inset-0 overflow-hidden outline-red flex justify-center items-center flex-column text-center" :style="{ height: `${screen.size.height}px`, width: `${screen.size.width}px` }">
        <Overscan />
        <LedScreen v-if="'LRME'.includes(screen.id[0])" :screen="screen" :event="selectedEvent" />
        <ScreenF v-else-if="screen.id == 'F'" :screen="screen" :event="selectedEvent" />
        <ScreenA v-else-if="screen.id == 'A'" :screen="screen" :logoStyle="customStyle.logo" :event="selectedEvent" />
        <div v-if="screen.options.showBackground" class="absolute inset-0 bg-cover object-cover -z-1" :style="backgroundStyle">
            <video v-if="backgroundVideo != ''"  class="absolute inset-0 bg-cover object-cover -z-1" autoplay muted loop>
                <source :src="backgroundVideo" type="video/mp4">
            </video>
        </div>
        <div class="debug" v-if="screenConfig.debug">
            Showing: {{selectedEvent.id}} - {{selectedEvent.name}}<br />
            Global config: {{screenConfig}}
        </div>
    </section>
</template>
<script>
import Overscan from './Overscan'
import LedScreen from './LedScreen'
import ScreenF from './ScreenF'
import ScreenA from './ScreenA'
import { mapGetters, mapActions } from 'vuex'
export default {
    components: {
        Overscan,
        LedScreen,
        ScreenF,
        ScreenA
    },
    computed: {
        ...mapGetters('events', ['screenEvent']),
        ...mapGetters('configs', ['screenConfig']),
        backgroundStyle(){
            const { background } = this.screen.options
            if (background && background.length > 0) {
                if (this.isColor(background))
                    return { backgroundColor: background }
                return { backgroundImage: `url(${background})` }
            }
            return { backgroundImage: `url(${this.defaultBackground})` }
        },
        backgroundVideo(){
            const background = this.screen.options.background
            if (!this.screen.options.showBackground) {
                return ""
            }

            if (background && background.length > 0 && !this.isColor(background)) {
                return background;
            } else if (!background || background.length == 0) {
                return this.defaultBackground;
            }
            return ""
        },
        customStyle() {
            if (this.selectedEvent == null) {
                return {
                   primaryColor: "",
                   primaryColorDark: "",
                   logo: "",
                }
            }
            return {
                primaryColor: this.selectedEvent.style.primaryColor.computedValue || "",
                primaryColorDark: this.selectedEvent.style.primaryColorDark.computedValue || "",
                logo: this.selectedEvent.style.logo.computedValue || "",
            }
        },
        defaultBackground() {
            return this.selectedEvent.background.computedValue
        },
    },
    props: {
        screen: { type: Object, required: true },
        overrideEvent: { type: Object, default: null }
    },
    methods: {
        ...mapActions('events', ['bindScreenEvent']),
        ...mapActions('configs', ['bindScreenConfigRef']),
        isColor(background){
            return background.startsWith("#");
        }
    },
    data: () => ({
        loaded: false,
        selectedEvent: null,
    }),
    async mounted() {
        if (this.overrideEvent != null) {
            this.selectedEvent = this.overrideEvent
        } else {
            await this.bindScreenEvent()
            this.selectedEvent = this.screenEvent
        }

        await this.bindScreenConfigRef()
        this.loaded = true
    },
    watch: {
        'customStyle.primaryColor': {
            immediate: true,
            handler(primaryColor) {
                if(!primaryColor) return;
                document.documentElement.style.setProperty("--primary-color", primaryColor);
            }
        },
        'customStyle.primaryColorDark': {
            immediate: true,
            handler(primaryColorDark) {
                if(!primaryColorDark) return;
                document.documentElement.style.setProperty("--primary-color-dark", primaryColorDark);
            }
        }
    }
}
</script>
<style>
:root {
    --primary-color: rgba(0, 0, 255, 1);
    --primary-color-dark: rgba(255, 0, 0, 0.2)
}

.debug {
    font-size: 300%;
    opacity: 0.4;
    float: left;
    position: absolute !important;
    top: 0px !important;
    left: 0px !important;
    background-color: chocolate;
    border: dashed red 3px;
}
</style>
