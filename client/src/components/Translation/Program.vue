<template>
    <li class="mb-2 mr-5">
        <div class="bg-background-2 h-20 list-item">
            <div class="list-item-order">{{programElement.order}}</div>
            <div v-if="source" class="font-medium" >{{programElementText}}</div>
            <input v-else type="text" class="form-input" v-model="programElementText" @keyup="updateTranslation"/>
        </div>
    </li>
</template>

<script>
import Translation from '@/mixins/translation'
import { mapActions } from 'vuex'
export default {
    props: ['source', 'programElement', 'selectedLanguage'],
    mixins: [Translation],
    data: function() {
        return {
            programElementText: null,
            updateTimeout: null
        }
    },
    created: function(){
        this.updateText();
    },
    methods: {
        ...mapActions('translation', ['updateProgramElementRef']),
        updateText(){
            this.programElementText = this.inLanguage(this.programElement, this.selectedLanguage);
        },
        async updateTranslation(){
            clearTimeout(this.updateTimeout)
            this.updateTimeout = setTimeout(async () => {
                this.translateTo(this.programElement, this.selectedLanguage, this.programElementText);
                await this.updateProgramElementRef(this.programElement)
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