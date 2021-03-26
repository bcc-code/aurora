<template>
    <div class="bg-cover max-w-lg mx-auto preview px-2 py-3" :style="previewBackground" :class="{ 'opacity-30': element.isLocked }">
        <div class="flex flex-wrap justify-between items-center" v-if="element.title">
            <div class="flex items-center font-bold">
                <img v-if="element.icon" class="w-5 h-5 inline-block mr-5" :class="colorClass(element.icon.color)"
                    :src="require(`@/assets/img/icons/${element.icon.name}.png`)">
                {{element.title[language]}}
            </div>
            <div class="w-full my-2" v-if="hasDescription">
                {{element.description[language]}}
            </div>
            <div :class="{ 'w-full' : hasDescription }" class="text-right" v-if="element.button.label">
                <button class="preview-button font-bold px-2 py-1" :class="colorClass(element.button.color)">
                    {{element.button.label[language]}}
                    <img v-if="element.button.icon" class="ml-1 mb-0.5 w-3 h-3 inline-block"
                    :src="require(`@/assets/img/icons/${element.button.icon}.png`)">
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        element: {
            type: Object,
            required: true
        },
    },
    computed: {
        previewBackground() {
            const { background } = this.element
            if (background == null) return { background: '#1D2838' }
            return background.image ?
                { backgroundImage: `url(${background.image})` }
                : background.gradient && background.gradient.from && background.gradient.to ?
                { background: `linear-gradient(270deg, ${background.gradient.from} 0%, ${background.gradient.to} 100%)` }
                : { background: '#1D2838'}
        },
        hasDescription() {
            return this.element.description && this.element.description[this.language]
        },
    },
    methods: {
        colorClass(hex) {
            switch(hex) {
                case '#6eb0e6':
                    return 'blue'
                case '#e63c62':
                    return 'red'
                default:
                    return ''
            }
        }
    }
}
</script>
<style scoped>
.preview {
	border: 1px solid rgba(204, 221, 255, 0.0980392);
	box-sizing: border-box;
	border-radius: 12px;
}

.preview-button {
	border: 1px solid rgba(204, 221, 255, 0.0980392);
	box-sizing: border-box;
	border-radius: 20px;
}

.blue {
    -webkit-filter: invert(31%) sepia(34%) saturate(510%) hue-rotate(167deg) brightness(86%) contrast(112%);
    filter: invert(31%) sepia(34%) saturate(510%) hue-rotate(167deg) brightness(86%) contrast(112%);
}

.red {
    -webkit-filter: invert(74%) sepia(78%) saturate(1846%) hue-rotate(323deg) brightness(102%) contrast(86%);
    filter: invert(74%) sepia(78%) saturate(1846%) hue-rotate(323deg) brightness(102%) contrast(86%);
}
</style>