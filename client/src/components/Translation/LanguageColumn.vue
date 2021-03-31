<template>
    <div class="w-1/2">
        <section class="mx-3">
            <select v-model="language" class="mb-6 form-input">
                <option v-for="lang in filteredLocales" :key="lang.code" :data-content="lang.code">
                    {{lang.name}}
                </option>
            </select>
        </section>
        <div class="uppercase tracking-wide text-md font-bold px-4">{{$t('menu.questions')}}</div>
        <ul class="flex flex-col p-4 w-full">
            <Question v-for="question in questions" 
                :key="selectedLanguageCode + question.id" 
                :question="question" 
                :selectedLanguage="selectedLanguageCode"
                :source="source" />
        </ul>
        <div class="uppercase tracking-wide text-md font-bold px-4">{{$t('menu.program')}}</div>
        <ul class="flex flex-col p-4 w-full">
            <Program v-for="element in program"
                :key="selectedLanguageCode + element.id"
                :element="element"
                :selectedLanguage="selectedLanguageCode"
                :source="source" />
        </ul>
        <div class="uppercase tracking-wide text-md font-bold px-4">{{$t('menu.liveboard')}}</div>
        <ul class="flex flex-col p-4 w-full">
            <Liveboard v-for="element in liveboard"
                :key="selectedLanguageCode + element.id"
                :element="element"
                :selectedLanguage="selectedLanguageCode"
                :source="source" />
        </ul>
    </div>
</template>

<script>
import Question from './Question'
import Program from './Program'
import Liveboard from './Liveboard'
import { mapState } from 'vuex'
export default {
    components: {
        Question,
        Program,
        Liveboard
    },
    props: ['source', 'sourceLanguage'],
    data: function() {
        return {
            language: 'Norsk',
            locales: [{ code: 'en', name: 'English' },
                { code: 'no', name: 'Norsk' },
                { code: 'fr', name: 'Français'},
                { code: 'de', name: 'Deutsch'},
                { code: 'nl', name: 'Nederlands'},
                { code: 'es', name: 'Español'},
                { code: 'fi', name: 'Suomi' },
                { code: 'pl', name: 'Polski' },
                { code: 'hu', name: 'Magyar' },
                { code: 'pt', name: 'Português' },
                { code: 'ru', name: 'Pусский' },
                { code: 'sl', name: 'Slovenščina' },
                { code: 'tr', name: 'Türkçe' },
                { code: 'ro', name: 'Română' },
                { code: 'it', name: 'Italiano' }]
        }
    },
    created: function(){
        this.language = this.source ? 'Norsk' : 'English';
    },
    computed: {
        ...mapState('translation', ['questions', 'program', 'liveboard']),
        filteredLocales(){
            return this.locales.filter((lang) => lang.name != this.sourceLanguage);
        },
        selectedLanguageCode(){
            return this.locales.find((el) => el.name == this.language).code;
        }
    },
    watch: {
        language: {
            immediate: true,
            handler(newLang){
                this.$emit('languageChanged', newLang);
            }
        },
        sourceLanguage: {
            immediate: true,
            handler(newLang){
                if (this.language == newLang)
                    this.language = this.filteredLocales[0].name;
            }
        }
    }
}
</script>