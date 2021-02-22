<template>
    <section class="absolute inset-0 overflow-hidden outline-red flex justify-center items-center flex-column text-center" :style="{ height: `${screen.size.height}px`, width: `${screen.size.width}px` }">
        <Overscan />
        <LedScreen v-if="'LRME'.includes(screen.id[0])" :screen="screen"/>
        <ScreenF v-else-if="screen.id == 'F'" :screen="screen" />
        <ScreenA v-else-if="screen.id == 'A'" :screen="screen" />
        <div v-if="screen.options.showBackground" class="absolute inset-0 bg-cover object-cover -z-1" :style="backgroundStyle">
            <video v-if="screen.options.background && !isColor(screen.options.background)" class="absolute inset-0 bg-cover object-cover -z-1" autoplay muted loop>
                <source :src="screen.options.background" type="video/mp4">
            </video>
        </div>
    </section>
</template>
<script>
import Overscan from './Overscan'
import LedScreen from './LedScreen'
import ScreenF from './ScreenF'
import ScreenA from './ScreenA'
export default {
    components: {
        Overscan,
        LedScreen,
        ScreenF,
        ScreenA
    },
    computed: {
        backgroundStyle(){
            const { background } = this.screen.options
            if (background && background.length > 0) {
                if (this.isColor(background))
                    return { backgroundColor: background }
                return { backgroundImage: `url(${background})` }
            }
            return { backgroundImage: `url(${this.defaultBackground})` }
        }
    },
    props: {
        screen: { type: Object, required: true },
        defaultBackground: { type: String, required: false },
        customStyle: {type: Object, required: true }
    },
    methods: {
        isColor(background){
            return background.startsWith("#");
        }
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
    --primary-color: rgba(24, 38, 58, 0.8);
    --primary-color-dark: rgb(34, 52, 72)
}
</style>