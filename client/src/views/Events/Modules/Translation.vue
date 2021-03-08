<template>
    <div class="w-full mt-8">
        <Title class="mb-5" >Translations</Title>
        <template v-if="!loaded" />
        <div class="flex" v-else>
            <LanguageColumn :source="true" @languageChanged="updateSourceLanguage" />
            <LanguageColumn :sourceLanguage="sourceLanguage"  />
        </div>
	</div>
</template>

<script>
import LanguageColumn from '@/components/Translation/LanguageColumn.vue'
import { mapState, mapActions } from 'vuex'

export default {
    components: {
        LanguageColumn
    },
    data: function(){
        return {
            sourceLanguage: '',
            loaded: false
        }
    },
    async mounted(){
        await this.bindQuestions();
        await this.bindProgram();
        await this.bindLiveboard();
        await Promise.all(this.questions.map(async (question) => {
            await this.bindAnswers(question.id)
        }));
        this.loaded = true;
    },
    computed: {
        ...mapState('translation', ['questions', 'program', 'liveboard']),
    },
    methods: {
        ...mapActions('translation', ['bindQuestions', 'bindProgram', 'bindAnswers', 'bindLiveboard']),
        updateSourceLanguage(value){
            this.sourceLanguage = value;
        }
    }
}
</script>