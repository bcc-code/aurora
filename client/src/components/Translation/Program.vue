<template>
    <li class="mb-2 mr-5">
        <div class="bg-background-2 h-20 list-item">
            <div class="list-item-order">{{element.order}}</div>
            <div v-if="source" class="font-medium" >{{elementText}}</div>
            <input v-else type="text" class="form-input" v-model="elementText" @keyup="updateTranslation"/>
        </div>
    </li>
</template>

<script>
import Translation from '@/mixins/translation'
import { mapActions } from 'vuex'
export default {
    props: ['source', 'element', 'selectedLanguage'],
    mixins: [Translation],
    data: function() {
        return {
            elementText: null,
            updateTimeout: null
        }
    },
    created: function(){
        this.updateText();
    },
    methods: {
        ...mapActions('translation', ['updateProgramElement']),
        updateText(){
            this.elementText = this.inLanguage(this.element, this.selectedLanguage);
        },
        async updateTranslation(){
            clearTimeout(this.updateTimeout)
            this.updateTimeout = setTimeout(async () => {
                this.translateTo(this.element, this.selectedLanguage, this.elementText);
                await this.updateProgramElement(this.element)
            }, 1000);
        }
    },
    watch: {
        selectedLanguage: {
            immediate: true,
            handler() {
                this.updateText()
            },
        },
    }
}
</script>