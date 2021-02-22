<template>
    <div class="w-full mt-8">
        <Title class="mb-5" >Translations</Title>
        <template v-if="!loaded" />
        <div class="flex" v-else>
            <LanguageColumn :source="true" :questions="questions" :program="program" @languageChanged="updateSourceLanguage" />
            <LanguageColumn :questions="questions" :program="program" :sourceLanguage="sourceLanguage"  />
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
        await this.bindQuestionsRef();
        await this.bindProgramRef();
        await Promise.all(this.questions.map(async (question) => {
            await this.bindAnswersRef(question.id)
        }));
        this.loaded = true;
    },
    computed: {
        ...mapState('translation', ['questions', 'program']),
    },
    methods: {
        ...mapActions('translation', ['bindQuestionsRef', 'bindProgramRef', 'bindAnswersRef']),
        updateSourceLanguage(value){
            this.sourceLanguage = value;
        }
    }
}
</script>