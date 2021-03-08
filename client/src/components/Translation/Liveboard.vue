<template>
    <li class="mb-2 mr-5">
        <div class="bg-background-2 h-48 list-item">
            <div class="list-item-order">{{element.order}}</div>
            <div class="grid gap-4 w-full">
                <template v-if="source">
                    <div class="font-medium h-12 pt-2">{{title}}</div>
                    <div class="font-medium h-12 pt-2">{{description}}</div>
                    <div class="font-medium h-12 pt-2">{{label}}</div>
                </template>
                <template v-else>
                    <input type="text" class="form-input" v-model="title" @keyup="updateTranslation"/>
                    <input type="text" class="form-input" v-model="description" @keyup="updateTranslation"/>
                    <input type="text" class="form-input" v-model="label" @keyup="updateTranslation"/>
                </template>
            </div>
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
            title: null,
            description: null,
            label: null,
            updateTimeout: null
        }
    },
    created: function(){
        this.updateValues();
    },
    methods: {
        ...mapActions('translation', ['updateLiveboardElement']),
        updateValues(){
            this.title = this.inLanguage(this.element, this.selectedLanguage, false, 'title');
            this.description = this.inLanguage(this.element, this.selectedLanguage, false, 'description');
            this.label = this.inLanguage(this.element, this.selectedLanguage, false, 'button.label');
        },
        async updateTranslation(){
            clearTimeout(this.updateTimeout)
            this.updateTimeout = setTimeout(async () => {
                this.translateTo(this.element, this.selectedLanguage, this.title, 'title');
                this.translateTo(this.element, this.selectedLanguage, this.description, 'description');
                this.translateTo(this.element, this.selectedLanguage, this.label, 'button.label');
                await this.updateLiveboardElement(this.element)
            }, 1000);
        }
    },
    watch: {
        selectedLanguage: {
            immediate: true,
            handler() {
                this.updateValues()
            },
        },
    }
}
</script>