<template>
    <div class="bg-cover max-w-lg mx-auto preview px-2 py-3" :style="previewBackground">
        <div class="font-bold mb-3" v-if="element.title">
            <img v-if="element.icon" class="w-5 h-5 inline-block mr-5" :src="require(`@/assets/img/${element.icon}.svg`)">
            {{element.title[language]}}
        </div>
        <div v-if="element.description">
            {{element.description[language]}}
        </div>
        <div class="text-right" v-if="element.label">
            <button class="preview-button font-bold px-2 py-1">
                {{element.label[language]}}
            </button>
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
            if (background == null) return { background: 'bg-mirage' }
            return background.image ?
                { backgroundImage: background.image }
                : background.gradient ?
                { background: `linear-gradient(270deg, ${background.gradient.from} 0%, ${background.gradient.to} 100%)` }
                : { background: 'bg-mirage'}
        }
    },
}
</script>
<style>
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
</style>